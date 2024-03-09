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
        // console.log('cartDetails:',cartDetails);
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

        const {productId,count}=req.body;
        const userId=req.session.userId;
        
        const existingProduct=await Cart.findOne({userId:userId,'product.productId':productId},{'product.$':1});
        console.log('existingProduct:',existingProduct);

        //find the total product stock 
        const totalProductStock=await Products.findOne({_id:productId},{quantity:1});
        // console.log('totalProductStock:',totalProductStock);
        if(totalProductStock.quantity==0){
            return res.json({addedToCart:'not done'})
        }

        if(existingProduct){

            //find the quantity of existing product in the cart 
            const currentQty=existingProduct.product.find((product)=> product).quantity;
            console.log('CurrentQty:',currentQty,"totalProductStock:",totalProductStock.quantity);

            if(count==-1 && count+currentQty <1){
                return res.json({added:false});
            }

            if(count==1 && count+currentQty> totalProductStock.quantity){
                return res.json({added:false,message:"failed to add item: cannot increase"});
            }

            //finding the product price 
            const priceOfProduct=existingProduct.product.find((product)=> product.productId==productId).price;
            console.log('priceOfProduct:',priceOfProduct);

            // increment the product quantity and total price
            const incrementedProduct=await Cart.findOneAndUpdate(
                {userId:userId,'product.productId':productId}, 
                {$inc:{
                    'product.$.quantity':count,
                    'product.$.totalPrice':count*priceOfProduct
                }},
                {new:true}
            );
            console.log('incrementedProduct',incrementedProduct);
            
            res.json({added:true});

        }else{
            console.log('ok, reached new cart method!!!!!1');
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
// remove product from the cart
const removeProduct=async (req,res)=>{
    try {
        console.log(':::::::reached delete product!!!::::::::::::');


       const {productId}=req.body;
       const user=req.session.userId;
       
       await Cart.findOneAndUpdate({userId:user,},{$pull:{product:{productId:productId}}});

       res.json({removed:true})
    
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500') 
    }
}
module.exports= {
    loadCartPage,
    addProductsToCart,
    removeProduct
}
