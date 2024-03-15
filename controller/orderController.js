// const User=require('../model/userModel');
const Address=require('../model/addressModel');
const Cart=require('../model/cartModel');
const Order=require('../model/orderModel');
const Products=require('../model/productsModel');

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
        
        // console.log("req.body from checkout page:", req.body);
        const userId=req.session.userId;
        const {addressId,paymentMethod}=req.body;

        const address=await Address.findOne({userId:userId,'address._id':addressId});
        // console.log('address:',address);
        const selectedAddress=address.address.filter((address)=> address._id==addressId);
        console.log( 'selectedAddress:',selectedAddress);
        
        const cartData=await Cart.findOne({userId:userId});
        console.log('cartData:',cartData);
        const subTotal=cartData?.product.reduce((total,currentTotal)=> total+currentTotal.totalPrice,0);

        // console.log('cartData:',cartData);

        const status='placed'
        
        const orderItems=cartData.product.map((product,index)=>({
            productId:product.productId,
            quantity:product.quantity,
            price:product.price,
            totalPrice:product.totalPrice,
            productStatus:status
        }));
        console.log('cartProducts:orderItems:',orderItems);

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
        console.log('orderDetails:',orderDetails);

        if(status=="placed"){
            for(const item of orderItems){
                await Products.updateOne(
                    {_id:item.productId},
                    {
                        $inc:{quantity:-item.quantity}
                    })
            }
            // orderItems.forEach((item)=>{
            // })
            await Cart.deleteMany({});
            res.redirect('/orderSuccess')
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

const loadSuccessPage=async (req,res)=>{
    try {

        res.render('orderSuccess');
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}


module.exports={
    loadCheckoutPage,
    placeOrder,
    loadSuccessPage
}