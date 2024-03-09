const Cart=require('../model/cartModel');
const Products=require('../model/productsModel');

//load cart page
const loadCartPage=async (req,res)=>{
    try {
        const user=req.session.userId;
        const populateOption={
            path:'product.productId',
            model:'products'
        }
        const cartDetails=await Cart.findOne({userId:user}).populate(populateOption);
        console.log('cartDetails:',cartDetails);
        res.render('cart',{user,cartDetails});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}

//addtocart post
const addProductsToCart=async (req,res)=>{
    try {
        console.log(':::::::reached cart controller post::::::::::::');

        const productId=req.body.productId;
        const userId=req.session.userId;

        const existingProduct=await Cart.findOne({userId:userId,'product.productId':productId});
        console.log('existingProduct:',existingProduct);

        

        if(existingProduct){
            
            //finding the product price 
            const priceOfProduct=existingProduct.product.find((product)=> product.productId==productId).price;
            console.log('priceOfProduct:',priceOfProduct);


            const incrementedProduct=await Cart.findOneAndUpdate(
                {userId:userId,'product.productId':productId}, 
                {$inc:{
                    'product.$.quantity':1,
                    'product.$.totalPrice':priceOfProduct
                }},
                {new:true}
            );
            console.log('incrementedProduct',incrementedProduct);
            
            res.json({added:true});



        }else{



            const productDetails=await Products.findOne({_id:productId});

            await Cart.findOneAndUpdate(
                {userId:userId},
                {
                    $set:{userId:userId},
                    $push:{
                        product:{
                            productId:productDetails._id,
                            price:productDetails.price,
                            quantity:1,
                            totalPrice:productDetails.price
                        }
                    }
                },{upsert:true});
             // console.log('newCart:',newCart);    
             console.log('added new product to the cart!');
             res.json({addedNew:true})
        }

        // console.log('productDetails:',productDetails);
        // console.log('userId:',userId,"productId:",productId);
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500') 
    }
}

module.exports= {
    loadCartPage,
    addProductsToCart
}
