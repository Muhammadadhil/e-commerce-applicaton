// const User=require('../model/userModel');
const Address=require('../model/addressModel');
const Cart=require('../model/cartModel');
const Order=require('../model/orderModel');
const Products=require('../model/productsModel');
const Razorpay=require('razorpay');
// const {createHmac}=require('node:crypto');
const crypto =require('crypto');
const Coupon=require('../model/couponModel');
const User=require('../model/userModel');


let instance = new Razorpay(
    {
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET 
    }
)

//checkout
const loadCheckoutPage=async (req,res)=>{
    try {
        const user=req.session.userId;
        const userAddresses=await Address.findOne({userId:user});

        const populateOption=[
            {
                path:'product.productId',
                model:'products'
            },
            {
                path:'couponDiscount',
                model:'Coupon'
            }
            
        ]
        const cartDetails=await Cart.findOne({userId:user}).populate(populateOption);
        if(!cartDetails){
            return res.redirect('/cart')
        }

        const itemsCount=cartDetails?.product.length;
        const subTotal=cartDetails.product.reduce((total,current)=>{
            return total+current.productId.price*current.quantity
        },0);
        const currentDate=new Date();
        const coupons=await Coupon.find({activationDate:{$lte:currentDate},expiryDate:{$gte:currentDate}});

        res.render('checkout',{user,itemsCount,userAddresses,cartDetails,subTotal,coupons});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//place order post 
const placeOrder=async (req,res)=>{
    try {
        
        const userId=req.session.userId;
        const {addressId,paymentMethod}=req.body;
        console.log('userId:',userId,"addressId:",addressId);
        
        console.log('paymemt method:',paymentMethod);
        const status=paymentMethod=="cash on delivery" ? 'placed' : 'pending'
        // const selectedAddress=await Address.aggregate([
        //     {$unwind:"$address"},
        //     {$match:{userId:userId,"address._id":addressId}}
        // ])

        const result=await Address.findOne({userId:userId,'address._id':addressId})
        const selectedAddress=result.address.find(address => address._id == addressId);
            
        const populateOption={
            path:'product.productId',
            model:'products'
        }

        const cartData=await Cart.findOne({userId:userId}).populate(populateOption).populate('couponDiscount');
        
        const subTotal=(cartData?.product.reduce((total,current)=> total+current.productId.price*current.quantity,0)) - (cartData?.couponDiscount?.discountAmount ?? 0);

        console.log('cartData:',cartData);
        console.log('subtotal:',subTotal);

        let orderItems=cartData.product.map((product,index)=>({
            productId:product.productId,
            quantity:product.quantity,
            price:product.productId.price,
            totalPrice:product.productId.price*product.quantity,
            productStatus:status
        }));
        console.log('orderItems:',orderItems)
        
        const order=new Order({
            userId:userId,
            products:orderItems,
            deliveryAddress:selectedAddress,
            payment:paymentMethod,
            orderDate:new Date(),
            orderStatus:status,
            subTotal:subTotal,
        })

        const orderDetails=await order.save();
        const orderId=orderDetails._id
        console.log('orderDetails:',orderDetails);

        if(status=="placed"){
            for(const item of orderItems){
                await Products.updateOne(
                    {_id:item.productId},
                    {
                        $inc:{quantity:-item.quantity}
                    })
            }
            console.log('req.session:',req.session)
            console.log('req.session.couponUsed:',req.session.couponUsed)

            if(req.session.couponUsed){
                await Coupon.findOneAndUpdate(
                    {_id:couponUsed._id},
                    {$addToSet:{usedUser:userId}}
                );
            }
            await Cart.deleteMany({});
            // res.redirect(`/orderSuccess?id=${orderDetails._id}`);
            res.status(200).json({codSuccess:true,orderId});

        }else if(status=='pending'){
        
            const options={
                amount: subTotal*100,
                currency: "INR",
                receipt: orderId,
            };

            //creating instace for razorpay order
            instance.orders.create(options,(err,order)=>{
                if(err){
                    console.log("error:",err);
                }
                console.log("new Order:",order);
                res.json({onlineSuccess:true,order})
                
            });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}


//verify razorpay payment
const verifyOnlinePayment=async (req,res)=>{
    try {
        const userId=req.session.userId;
        console.log('verify payment route reacheddd!!');
        const {response,order}=req.body;
        console.log(req.body);

        let hmac=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET);
        hmac.update(response.razorpay_order_id + '|' + response.razorpay_payment_id);
        hmac=hmac.digest('hex'); 

        if(hmac == response.razorpay_signature){
            
            const orderId=order.receipt;
            await Order.findByIdAndUpdate({_id:order.receipt},{$set:{ orderStatus:'placed'}});
    
            const orderData=await Order.findOne({_id:order.receipt},{products:1});
            
            // decreasing ordered products quantiy & change product status
            for(const item of orderData.products){
                await Order.findOneAndUpdate({_id:order.receipt,'products.productId':item.productId},{$set:{'products.$.productStatus':'placed'}});
                await Products.updateOne({_id:item.productId},{
                    $inc:{quantity:-item.quantity}
                })
            }
            console.log('session:',req.session);
            console.log('req.session.couponused:',req.session.couponUsed);
            const couponUsed=req.session.couponUsed;
            if(couponUsed){
                await Coupon.findOneAndUpdate(
                    {_id:couponUsed._id},
                    {$addToSet:{usedUser:userId}}
                );
                console.log('applied coupon stored in coupon usedUser')
            }
            await Cart.deleteMany({});

            res.json({statusChanged:true,orderId});
        
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const loadSuccessPage=async (req,res)=>{
    try {
        const user=req.session.userId;
        const orderId=req.query.id;
        const cartDetails=await Cart.findOne({userId:user});
        const itemsCount=cartDetails?.product.length;
        res.render('orderSuccess',{orderId,user,itemsCount});
         3
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const loadFailurePage=async (req,res)=>{
    try {
        const user=req.session.userId;
        const orderId=req.query.id;
        const cartDetails=await Cart.findOne({userId:user});
        const itemsCount=cartDetails?.product.length;
        res.render('orderFailure',{orderId,user,itemsCount});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}
const loadOrderDetails=async (req,res)=>{
    try {

        const user=req.session.userId;
        const orderId=req.query.id;
        console.log('orderId:',orderId); 
        populateOption={
            path:'products.productId',
            model:'products'
        }
        const cartDetails=await Cart.findOne({userId:user});
        const itemsCount=cartDetails?.product.length;
        const orderData=await Order.findOne({_id:orderId}).populate(populateOption);
        console.log('orderData:',orderData);
        res.render('orderDetails',{user,orderData,itemsCount});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//cancel
const cancelProductOrder=async (req,res)=>{
    try {
        const userId=req.session.userId;
        const {orderId,productId,text}=req.body;
        console.log('orderId,productId',orderId,productId);

        const updateData=await Order.findOneAndUpdate({_id:orderId,'products.productId':productId},
        {
            $set:{'products.$.productStatus':'canceled'}

        },{new:true})
        
        if(updateData.payment!=="cash on delivery"){
            let returnPrice;
            const date=new Date();
            updateData.products.forEach((product) => {
                if (String(product.productId)=== productId) {
                    returnPrice = product.totalPrice;
                }
            });
            console.log('return price:',returnPrice);
            
            //adding amount to wallet
            await User.findOneAndUpdate(
                { _id: userId }, 
                { 
                    $inc: { walletAmount: returnPrice }, 
                    $push: { 
                        walletHistory: {
                            amount: returnPrice,
                            description: text,
                            date: date
                        }
                    }
                }
            );
            //decreasing order total amount 
            await Order.findByIdAndUpdate({_id:orderId},{$inc:{subTotal:-returnPrice}});
        }
        
        if(updateData){
            res.status(200).json({changed:true,updateData})
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const returnProductOrder=async (req,res)=>{
    try {
        console.log('!!!!!!!!hey reached return product order!!!1');

        const userId=req.session.userId;
        const {orderId,productId,text}=req.body;
        console.log('orderId,productId',orderId,productId);

        const updateData=await Order.findOneAndUpdate({_id:orderId,'products.productId':productId},
        {
            $set:{'products.$.productStatus':'returned'}

        },{new:true})
        
        let returnPrice;
        const date=new Date();
        const product = await Products.findOne({ _id: productId });
        const productName = product.name;
        console.log('productname:',productName);
        const description=`returned product ${productName}`;
        updateData.products.forEach((product) => {
            if (String(product.productId)=== productId) {
                returnPrice = product.totalPrice;
            }
        });
        console.log('return price:',returnPrice);

        await User.findOneAndUpdate(
            { _id: userId }, 
            { 
                $inc: { walletAmount: returnPrice }, 
                $push: { 
                    walletHistory: {
                        amount: returnPrice,
                        description: description,
                        date: date
                    }
                }
            }
        );

        if(updateData){
            res.status(200).json({changed:true,updateData})
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//pay again when it is pending
const payAgain=async (req,res)=>{
    try {
        console.log('reqdched pay agian!!!');
        const orderId=req.query.id;
        const orderData=await Order.findOne({_id:orderId});
        console.log('currentOrderId:',orderId);

        const options={
            amount: orderData.subTotal*100,
            currency: "INR",
            receipt: orderId
        };

        //creating instace for razorpay order
        instance.orders.create(options,(err,order)=>{
            if(err){
                console.log("error:",err);
            }
            console.log("new Order:",order);
            res.json({createInstance:true,order});
            
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

module.exports={
    loadCheckoutPage,
    placeOrder,
    loadSuccessPage,
    loadFailurePage,
    loadOrderDetails,
    cancelProductOrder,
    verifyOnlinePayment,
    returnProductOrder,
    payAgain,
}