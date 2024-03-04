const Products=require('../model/productsModel');
const Category=require('../model/categoryModel');


//load the products page
const loadProducts=async (req,res)=>{
    try {
        const products=await Products.find().populate('categoryId');
        res.render('products',{products});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/error-500') 

    }
}
//load add products page
const loadAddProducts=async (req,res)=>{
    try {
        const categories=await Category.find({})
        res.render('addProducts',{categories});
     
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/error-500'); 
    }
}
//add products post 
const addProducts=async (req,res)=>{
    try {
        
        const details=req.body;
        const files=req.files;
        
        const category=await Category.findOne({name:details.category});
 
        console.log("req.files:",req.files);
        console.log("files:",files);

        const newProduct=new Products({
            name:details.productName,
            price:details.price,
            quantity:details.quantity,
            categoryId:category._id,
            description:details.description,
            images:{
                image1:files[0].filename,
                image2:files[1].filename,
                image3:files[2].filename,
                image4:files[3].filename
            }
        })

       const savedProduct=await newProduct.save()
       if(savedProduct){
            res.redirect('/admin/products')
       }else{
            res.render('addProducts');
       }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/error-500') 
    }
}

const loadEditProduct=async (req,res)=>{
    try {
        console.log(':::::::::::::welcome to edit product::::::::::::::');

        const productId=req.query.id;    
        console.log('productId:',productId);

        const productData=await Products.findOne({_id:productId}).populate('categoryId');
        const categories=await Category.find({});
        console.log('products data for edit pagge:',productData);
        res.render('editProducts',{productData,categories})

    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/error-500'); 
    }
}

const updateProducts=async (req,res)=>{
    try {

        console.log(':::::::::welcome to edit product Post::::::::');

        const productId=req.query.id;
        console.log('productId:',productId);
        const details=req.body;
        const files=req.files;

        console.log('details from edit product page:',details);
        console.log("files:::::",files);

        const existingDetails=await Products.findById({_id:productId});
        const hasNewFiles=!!files  //converts to boolean
        console.log('hasnew files:',hasNewFiles);

        //check there is new files added , if not adding defult ones
        const images=hasNewFiles?[
            files.image1?.[0]?.filename || existingDetails.images.image1,
            files.image2?.[0]?.filename || existingDetails.images.image2,
            files.image3?.[0]?.filename || existingDetails.images.image3,
            files.image4?.[0]?.filename || existingDetails.images.image4  
        ]:[
            existingDetails.images.image1,
            existingDetails.images.image2,
            existingDetails.images.image3,
            existingDetails.images.image4
        ]
        
        //finding the category of edited product
        const category=await Category.findOne({name:details.category});
        const newCategoryId=category._id;

        const editedProduct={
            name:details.productName,
            quantity:details.quantity,
            price:details.price,
            categoryId:newCategoryId,
            description:details.description,
            images:{
                image1:images[0],
                image2:images[1],
                image3:images[2],
                image4:images[3]
            }
        }
        const updatedProduct=await Products.findByIdAndUpdate({_id:productId},editedProduct,{new:true});

       if(updatedProduct){
            res.redirect('/admin/products')
       }else{
            res.render('editProducts');
       }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500');
    }
}

const blockProduct=async (req,res)=>{
    try {
        console.log('::::reached block product::::');
        const {productId}=req.body;
        console.log(productId); 
        const productData=await Products.findOne({_id:productId});
        console.log(productData);
        if(productData.isDeleted){
            await Products.findByIdAndUpdate({_id:productId},{$set:{isDeleted:false}});
        }else{
            await Products.findByIdAndUpdate({_id:productId},{$set:{isDeleted:true}});
        }
        res.json({result:true})

    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/error-500');
    }
}
module.exports={
    loadProducts,
    loadAddProducts,
    addProducts,
    loadEditProduct,
    updateProducts,
    blockProduct
}