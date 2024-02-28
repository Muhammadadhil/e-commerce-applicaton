const User=require('../model/userModel');
const Category=require('../model/categoryModel');
const bcrypt=require('bcrypt');


//load admin login page
const loginLoad=async (req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
//login post
const verifyAdmin=async (req,res)=>{
    try {
        const {email,password}=req.body;
        console.log(`email:${email} & password:${password}`);
        const adminData=await User.findOne({email:email});
        
        if(adminData){
            const matchPassword=await bcrypt.compare(password,adminData.password);
            console.log('matchpassword',matchPassword);
            
            if(matchPassword){
                if(adminData.isAdmin){
                    res.json({admin:true,message:'Welcome Administrator'})
                }else{
                    res.json({admin:false,message:'email or password in incorrect'})
                }
            }else{
                return res.json({admin:false,message:'Incorrect Password'});
            }
        }else{
            res.json({admin:false,message:'Your email or password is incorrect'});
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error500');
        
    }
}
//load the home page
const loadHome=async (req,res)=>{
    try {
        res.render('adminDashboard')
    } catch (error) {
        console.log(error.message);
        
    }
}
//load the users page
const loadCustomers=async (req,res)=>{
    try {
        const customers=await User.find({})
        // console.log('users:',customers);
        res.render('customers',{users:customers})
    } catch (error) {
        console.log(error.message);
        
    }
}

//block and unblock the users
const userBlock=async (req,res)=>{
    try {
        const user_id=req.body.user_id;
        const userData=await User.findOne({_id:user_id});
        if(!userData.isBlocked){
            await User.findByIdAndUpdate({_id:user_id},{$set:{isBlocked:true}})
        }else{
            await User.findByIdAndUpdate({_id:user_id},{$set:{isBlocked:false}})
        }
        res.json({res:true})

    } catch (error) {
        console.log(error.message);   
    }
}
//load the category page
const loadCategory=async (req,res)=>{
    try {
        const categories=await Category.find({});
        res.render('category',{categories});
    } catch (error) {
        console.log(error.message);
        
    }
}
//add category
const addCategory=async (req,res)=>{
    try {
        const {name,description}=req.body;
        const existingName= await Category.findOne({name:name});

        console.log('already exist in db:',existingName);
        if(existingName){
            return res.json({added:false,message:'category already exist'})
        }
        console.log('name and description:',name,description);
        const newCategory=new Category({
            name:name,
            description:description,
            isBlocked:false
        })  

        const savedCategory=newCategory.save();

        if(savedCategory){
            res.json({added:true,message:'Category added successfully'})
        }else{
            res.json({added:false,message:'Category not added'})
        }
    } catch (error) {
        console.log(error.message);
        
    }
}
//edit category
const editCategory=async (req,res)=>{
    try {
        const categoryId=req.query.id;
        console.log("category id:",categoryId);
        const categoryData=await Category.findById({_id:categoryId});
        console.log('category with the id:',categoryData);
        res.render('editCategory',{categoryData});

    } catch (error) {
        console.log(error.message);
    }
}
//edit category post
const updateCategory=async (req,res)=>{
    try {
        console.log('reached update category');
        const {name,description,categoryId}=req.body;
        const existingName= await Category.findOne({name:name});

        console.log('already exist in db:',existingName);
        if(existingName){
            return res.json({update:false,message:'category already exist'})
        }else{
            const updatedCategory=await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:name,description:description}});

        }
        if(updatedCategory){
            res.json({update:true});
            console.log('data updated');
        }else{
            res.json({update:false});
        }
        // console.log("id:",req.query.id);
        
    } catch (error) {
        console.log(error.message);
        
    }
}

//soft delete the category
const deleteCategory=async (req,res)=>{
    try {
        const {categoryId}=req.body;
        const deletedCategory=await Category.findByIdAndUpdate({_id:categoryId},{$set:{isDeleted:true}})
        if(deletedCategory){
            res.json({deleted:true});
        }else{
            res.json({deleted:false})
        }

    } catch (error) {
        console.log(error.message);
    }
}

// //load the products page
// const loadProducts=async (req,res)=>{
//     try {
//         const products=await Products.find().populate('categoryId');
//         res.render('products',{products});
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// //load add products page
// const loadAddProducts=async (req,res)=>{
//     try {
//         const categories=await Category.find({})
//         res.render('addProducts',{categories});
     
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// //add products post 
// const addProducts=async (req,res)=>{
//     try {
        
//         const details=req.body;
//         const files=req.files;
        
//         const category=await Category.findOne({name:details.category});
 
//         console.log("req.files:",req.files);
//         console.log("files:",files);

//         const newProduct=new Products({
//             name:details.productName,
//             price:details.price,
//             quantity:details.quantity,
//             categoryId:category._id,
//             description:details.description,
//             images:{
//                 image1:files[0].filename,
//                 image2:files[1].filename,
//                 image3:files[2].filename,
//                 image4:files[3].filename
//             }
//         })

//        const savedProduct=await newProduct.save()
//        if(savedProduct){
//             res.redirect('/admin/products')
//        }else{
//             res.render('addProducts');
//        }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const loadEditProduct=async (req,res)=>{
//     try {
//         console.log(':::::::::::::welcome to edit product::::::::::::::');

//         const productId=req.query.id;    
//         console.log('productId:',productId);

//         const productData=await Products.findOne({_id:productId}).populate('categoryId');
//         const categories=await Category.find({});
//         console.log('products data for edit pagge:',productData);
//         res.render('editProducts',{productData,categories})

//     } catch (error) {
//         console.log(error.message);
        
//     }
// }

// const updateProducts=async (req,res)=>{
//     try {

//         console.log(':::::::::welcome to edit product Post::::::::');

//         const productId=req.query.id;
//         console.log('productId:',productId);
//         const details=req.body;
//         const files=req.files;

//         console.log('details from edit product page:',details);
//         console.log("files:::::",files);

//         const existingDetails=await Products.findById({_id:productId});
//         const hasNewFiles=files.length>0;

//         //check there is new files added , if not adding defult ones
//         const images=hasNewFiles?[
//             files[0]?.filename || existingDetails.images.image1,
//             files[1]?.filename || existingDetails.images.image2,
//             files[2]?.filename || existingDetails.images.image3,
//             files[3]?.filename || existingDetails.images.image4  
//         ]:[
//             existingDetails.images.image1,
//             existingDetails.images.image2,
//             existingDetails.images.image3,
//             existingDetails.images.image4
//         ]
        
//         //finding the category of edited product
//         const category=await Category.findOne({name:details.category});
//         const newCategoryId=category._id;

//         const editedProduct={
//             name:details.productName,
//             quantity:details.quantity,
//             price:details.price,
//             categoryId:newCategoryId,
//             description:details.description,
//             images:{
//                 image1:images[0],
//                 image2:images[1],
//                 image3:images[2],
//                 image4:images[3]
//             }
//         }

//         const updatedProduct=await Products.findByIdAndUpdate({_id:productId},editedProduct,{new:true});

    
//        if(updatedProduct){
//             res.redirect('/admin/products')
//        }else{
//             res.render('editProducts');
//        }
        
//     } catch (error) {
//         console.log(error.message);
        
//     }
// }

module.exports={
    loginLoad,
    verifyAdmin,
    loadHome,
    loadCustomers,
    userBlock,
    loadCategory,
    addCategory,
    editCategory,
    updateCategory,
    deleteCategory
}
