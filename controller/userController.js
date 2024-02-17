const User=require('../model/userModel');
const bcrypt=require('bcrypt');

//loading home page
const loadHomePage=(req,res)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}
//secure password using bcrypt
const hashPassword=async(password)=>{
    try {
        const hashedPassword=await bcrypt.hash(password,10);
        return hashedPassword;
    } catch (error) {
        console.log(error.message);
    }
} 

//login the about page
const loadAbout=async (req,res)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message);
    }
    
}

//loading the login page
const loginLoad=async (req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

//loading register page
const registerLoad=async (req,res)=>{
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
    
}
//loading the shop page
const loadShop=async (req,res)=>{
    try {
        res.render('shop');
    } catch (error) {
        console.log(error.message);
        
    }
}




//saving the user details
const insertUser=async (req,res)=>{
    const {firstname,lastname,email,username,password}=req.body;
    //securing the password
    const securePassword=await hashPassword(password);
    console.log(securePassword);

    const user=new User({
        firstName:firstname,
        lastname:lastname,
        email:email,
        username:username,
        password:securePassword
    })
    const newUser=await user.save();
    if(newUser){
        res.redirect('/otp')
    }else{
        res.send('error')
    }
}



//otp
const loadOtpPage=async (req,res)=>{
    try {
        res.render('otp');
    } catch (error) {
        console.log(error.message);  
    }
}

module.exports={
    loadHomePage,
    loadAbout,
    loginLoad,
    registerLoad,
    insertUser,
    loadShop,
    loadOtpPage
    
}