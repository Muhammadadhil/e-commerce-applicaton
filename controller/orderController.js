// const User=require('../model/userModel');
const Address=require('../model/addressModel');
const Cart=require('../model/cartModel');
const Order=require('../model/orderModel');
const Products=require('../model/productsModel');
const Razorpay=require('razorpay');
// const {createHmac}=require('node:crypto');
const crypto =require('crypto');
const Coupon=require('../model/couponModel');

let instance = new Razorpay(
    {
        key_id: process.env.razorpay_key_id,
        key_secret: process.env.razorpay_key_secret 
    }
)

//checkout
const loadCheckoutPage=async (req,res)=>{
    try {
        const user=req.session.userId;
        const userAddresses=await Address.findOne({userId:user});

        const populateOption={
            path:'product.productId',
            model:'products'
        }
        const cartDetails=await Cart.findOne({userId:user}).populate(populateOption);
        if(!cartDetails){
            return res.redirect('/cart')
        }

        const itemsCount=cartDetails?.product.length;
        const subTotal=cartDetails.product.reduce((total,current)=>{
            return total+current.productId.price*current.quantity
        },0);
        const currentDate=new Date();
        const coupons=await Coupon.find({activationDate:{$lte:currentDate}})

        res.render('checkout',{user,itemsCount,userAddresses,cartDetails,subTotal,coupons});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

let orderItems={};

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
            
        const cartData=await Cart.findOne({userId:userId});
        const subTotal=(cartData?.product.reduce((total,currentTotal)=> total+currentTotal.totalPrice,0))-cartData.couponDiscount;

        console.log('cartData:',cartData);
        console.log('subtotal:',subTotal);

        
        orderItems=cartData.product.map((product,index)=>({
            productId:product.productId,
            quantity:product.quantity,
            price:product.price,
            totalPrice:product.totalPrice,
            productStatus:status
        }));
        
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
        // console.log('orderDetails:',orderDetails);

        if(status=="placed"){
            for(const item of orderItems){
                await Products.updateOne(
                    {_id:item.productId},
                    {
                        $inc:{quantity:-item.quantity}
                    })
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
            await Cart.deleteMany({});
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}


//verify razorpay payment
const verifyOnlinePayment=async (req,res)=>{
    try {
        console.log('verify payment route reacheddd!!!');
        const {response,order}=req.body;
        console.log(req.body);

        let hmac=crypto.createHmac('sha256',process.env.razorpay_key_secret);
        hmac.update(response.razorpay_order_id + '|' + response.razorpay_payment_id);
        hmac=hmac.digest('hex'); 


        if(hmac == response.razorpay_signature){
            console.log('!!!signature verified!!!!');
            const orderId=order.receipt;
            await Order.findByIdAndUpdate({_id:order.receipt},{$set:{ orderStatus:'placed'}});
            
            // decreasing ordered products quantiy
            console.log('orderItems:',orderItems);
            for(const item of orderItems){
                await Products.updateOne({_id:item.productId},{
                    $inc:{quantity:-item.quantity}
                })
            }

            res.json({statusChanged:true,orderId});
        
        }else{

        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const loadSuccessPage=async (req,res)=>{
    try {
        const orderId=req.query.id;
        res.render('orderSuccess',{orderId});
        
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
        res.render('orderDetails',{user,orderData,itemsCount});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//cancel
const cancelProductOrder=async (req,res)=>{
    try {

        const {orderId,productId}=req.body;
        console.log('orderId,productId',orderId,productId);

        const updateData=await Order.findOneAndUpdate({_id:orderId,'products.productId':productId},
        {
            $set:{'products.$.productStatus':'canceled'}
        },{new:true})

        console.log('updateData:',updateData);
        if(updateData){
            console.log('reached success');
            res.status(200).json({changed:true,updateData})
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}



module.exports={
    loadCheckoutPage,
    placeOrder,
    loadSuccessPage,
    loadOrderDetails,
    cancelProductOrder,
    verifyOnlinePayment
}