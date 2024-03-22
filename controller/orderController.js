// const User=require('../model/userModel');
const Address=require('../model/addressModel');
const Cart=require('../model/cartModel');
const Order=require('../model/orderModel');
const Products=require('../model/productsModel');
const Razorpay=require('razorpay');

let instance = new Razorpay(
    {
        key_id: 'rzp_test_bHCQ2sAI4219I7',
        key_secret: 'YZ0M9r3rFrFuJs3Tlweg0SoD' 
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
        // console.log('cartDetais:',cartDetails);
        
        // console.log("cartDetails.product:",cartDetails?.product);
        const productsCount=cartDetails?.product.length;
        const subTotal=cartDetails?.product.reduce((total,currentTotal)=> total+currentTotal.totalPrice,0);
        
        
        res.render('checkout',{user,userAddresses,cartDetails,subTotal});
        
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
            
        const cartData=await Cart.findOne({userId:userId});
        const subTotal=cartData?.product.reduce((total,currentTotal)=> total+currentTotal.totalPrice,0);

        console.log('cartData:',cartData);
        
        const orderItems=cartData.product.map((product,index)=>({
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
                amount: subTotal,
                currency: "INR",
                receipt: orderId,
            };

            instance.orders.create(options,(err,order)=>{
                if(err){
                    console.log("error:",err);
                }
                console.log("new Order:",order);
                res.json({onlineSucces:true,order})
                
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
        console.log('verify payment route reacheddd!!!');
        // console.log('response',req.body.response);
        const {response,order}=req.body;
        // console.log('response',response);
        console.log(req.body);

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
        const orderData=await Order.findOne({_id:orderId}).populate(populateOption);
        res.render('orderDetails',{user,orderData});
        
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