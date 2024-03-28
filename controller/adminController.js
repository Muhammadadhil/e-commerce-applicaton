const User=require('../model/userModel');
const Category=require('../model/categoryModel');
const bcrypt=require('bcrypt');
const Order=require('../model/orderModel');
const Products=require('../model/productsModel');
const Coupon=require('../model/couponModel');

//load admin login page
const loginLoad=async (req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500')
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
                    req.session.adminId=adminData._id;
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
        res.status(500).render('error-500') 
    }
}
//load the home page
const loadHome=async (req,res)=>{
    try {
        res.render('adminDashboard')
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
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
        res.status(500).render('error-500') 

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
        res.status(500).render('error-500') 
    }
}
//load the category page
const loadCategory=async (req,res)=>{
    try {
        const categories=await Category.find({});
        res.render('category',{categories});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
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
        res.status(500).render('error-500') 
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
        res.status(500).render('error-500') 
    }
}
//edit category post
const updateCategory=async (req,res)=>{
    try {
        console.log('reached update category');
        const {name,description,categoryId}=req.body;
        const currentCategory= await Category.findOne({_id:categoryId});

        if(!currentCategory){
            return res.json({update:false,message:"category not found"})
        }

        console.log('name ,currentCategory.name:',name,currentCategory.name);
        if(name !== currentCategory.name){
            console.log('reached here');
            const existingName=await Category.findOne({name:name})
            console.log('existingname:',existingName);
            if(existingName){
                return res.json({update:false,message:'Category name already exist'})
            }
        }
        const updatedCategory=await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:name,description:description}});

        if(updatedCategory){
            res.json({update:true,message:'updated successfully'});
            console.log('data updated');
        }else{
            res.json({update:false,message:'there is a problem while updating your data'});
        }
        // console.log("id:",req.query.id);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

//block the category
const blockCategory=async (req,res)=>{
    try {
        const {categoryId}=req.body;
        const categoryData=await Category.findOne({_id:categoryId})
        categoryData.isBlocked=!categoryData.isBlocked ;
        await categoryData.save();
        
        const isBlocked=categoryData.isBlocked;
        
        const productsData=await Products.updateMany({categoryId:categoryId},{$set:{isCategoryBlocked:isBlocked}})
        console.log('productsData:',productsData);
        
        
        res.json({updated:true});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

const adminLogout=async (req,res)=>{
    try {
        
        delete req.session.adminId;
        res.redirect('/admin/');
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

//order 
const loadOrderList=async (req,res)=>{
    try {

        const orders=await Order.find({}); 
        res.render('order',{orders});

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

//order details
const loadOrderDetails=async (req,res)=>{
    try {
        const orderId=req.query.id;
        console.log('orderId:',orderId);   

        let populateOption={
            path:'products.productId',
            model:'products'
        }
        
        const orderData=await Order.findOne({_id:orderId}).populate(populateOption);
        const address=await Order.findOne({_id:orderId},{deliveryAddress:1,_id:0}); 
        
        console.log('orderData:',orderData,"address:",address);

        res.render('orderDetails',{address,orderData});

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

const changeOrderStatus=async (req,res)=>{
    try {
        console.log("reached here in update status");
        const {orderId,productId,status}=req.body;
        
        await Order.findOneAndUpdate(
            {_id:orderId,'products.productId':productId},
            {$set:{'products.$.productStatus':status}},
            {new:true}
        );
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
    

}


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
    blockCategory,
    adminLogout,
    loadOrderList,
    loadOrderDetails,
    changeOrderStatus,
}
