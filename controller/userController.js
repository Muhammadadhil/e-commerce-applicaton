
const User=require('../model/userModel');
const Products=require('../model/productsModel');
const userOtpVerfication=require('../model/userOtpVerfication');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
// const dotenv=require('')
const {registerationSchema}=require('../middleware/validate');
const { date } = require('joi');

//loading home page
const loadHomePage=(req,res)=>{
    try {
        const user=req.session.userId;
        console.log(`hello aadhi,this is user : ${user}`);
        // const blockedMessage=req.flash('blocked')
        res.render('home',{user})
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
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
        const user=req.session.userId;
        res.render('about',{user})
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }  
}

//loading the login page
const loginLoad=async (req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}

//loading register page
const registerLoad=async (req,res)=>{
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}
//load profle
const loadProfile=async (req,res)=>{
    try {
        const user=req.session.userId;
        console.log('user:',user);
        const userData=await User.findById({_id:user});
        // console.log('userData:',userData);
        res.render('account',{user,userData});
    } catch (error) {
        console.log(error.message);
        
    }
}

//edit profile post 
const editProfile=async (req,res)=>{
    try {
        console.log('reached edit profile');
        const {firstName,lastName}=req.body;
        const userId=req.session.userId;
        console.log('req.session.id:',req.session.userId,'firstname:',firstName,"lstname:",lastName);
        const updateData=await User.findByIdAndUpdate({_id:userId},{$set:{firstName:firstName,lastname:lastName}});
        console.log('updateData:',updateData);
        if(updateData){
            res.json({success:true});
        }else{
            res.json({success:false});
        }

    } catch (error) {
        console.log(error.message);
        
    }
}

const loadBlogPage=async (req,res)=>{
    try {
        const user=req.session.userId;
        res.render('blog',{user});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}

const loadContactPage=async (req,res)=>{
    try {
        const user=req.session.userId;
        res.render('contact',{user});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}


//loading the shop page
const loadShop=async (req,res)=>{
    try {
        const products=await Products.find({}).populate('categoryId');
        const user=req.session.userId;
        res.render('shop',{products,user});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}

//product details page load
const loadProductDetails=async (req,res)=>{
    try {
        const productId=req.query.id;
        const user=req.session.userId;
        const productData=await Products.findOne({_id:productId}).populate('categoryId');
        res.render('productDetails',{productData,user});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}

//login post 
const loginCheck=async (req,res)=>{
    try {
        const {email,password}=req.body;
        console.log(`email:${email} & password:${password}`);
        const userData=await User.findOne({email:email});
        
        if(userData){
            if(userData.isBlocked){
                res.json({user:false,message:'your account is blocked by admin'})
            }else{
                const matchPassword=await bcrypt.compare(password,userData.password);
                console.log('matchpassword',matchPassword);
                
                if(matchPassword){

                    req.session.userId=userData._id;
                    console.log("session :",req.session.userId);
                    res.json({user:true,message:'login successfull'})
    
                }else{
                    return res.json({user:false,message:'Incorrect Password'});
                }
            }

        }else{
            res.json({user:false,message:'Your email or password is incorrect'});
        }
        // res.json({success:'succesfull bro'});
        

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
}

//saving the user details
const insertUser = async (req, res) => {
    try {
        console.log('::::::reached insert user::::::');

        
        const { firstName, lastName, email,mobile, password} = req.body;

        await User.findOneAndDelete({email:email,verified:false});
        const existingEmail=await User.findOne({email:email});



        console.log('existing email:',existingEmail);
        if(existingEmail){
            return res.json({status:false,message:'Email already taken'})
        }
        //securing the password
        const securePassword = await hashPassword(password, 10);
        console.log(securePassword);

        const user = new User({
            firstName: firstName,
            lastname: lastName,
            email: email,
            mobile:mobile,
            password: securePassword,
            verified: false,
            isAdmin:false,
            isBlocked:false
        })
        console.log(`before saving userdetails:${user}`);
    
        const newUser = await user.save();
        console.log(newUser);
        if (newUser) {
            otpVerificationEmail(newUser, req, res);
            const id=newUser._id
            res.json({ status: true ,id});
        } else {
            res.json({ status: false, message: 'not saved!' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: 'Error saving user details' });
    }
}


//nodemailer-mail transporter
const transpoter=nodemailer.createTransport({
    host:'smtp.gmail.com',     //(Simple Mail Transfer Protocol) 
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:process.env.user_email,
        pass:process.env.user_password
    }
});

//otp verification
const otpVerificationEmail=async ({_id,email},req,res)=>{
    try {
        console.log('::::::reached otp verification email sending function::::::');
        console.log(`id:${_id} and email:${email}`);
        const otp=`${Math.floor(1000+Math.random()*900)}`
        console.log(" Generated OTP:"+otp);
        
        //mail option
        const mailOptions ={
            from:'muhammadadhil934@gmail.com',
            to:email,
            subject:'Two factor Authentication',
            html:`
            <html>
                <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <h1 style="color: #333;">Verify Your Email Address</h1>
                        <p style="color: #555; line-height: 1.5;">Enter the following OTP code to verify your email address. This code will expire in 1 minutes:</p>
                        <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
                        <p style="color: #555; line-height: 1.5;">If you did not request this verification, please ignore this email.</p>
                    </div>
                </body>
            </html>`
        }
        //hash the otp
        const saltRounds=10;
        const hashedOtp=await bcrypt.hash(otp,saltRounds);

        const newOtpVerification=await new userOtpVerfication({
            userId:_id,
            otp:hashedOtp,
            expiresAt:Date.now()+60000
        })

        //save the otp in database
        await newOtpVerification.save();
        //send the mail
        await transpoter.sendMail(mailOptions);
        
    } catch (error) {
        console.log("error : ",error);
        res.status(500).render('Error-500');
    }
};

//load verification page
const loadOtpPage=async (req,res)=>{
    try {
        console.log(`query id before rendering otp page: ${req.query.id}`);
        const OtpUserId=req.query.id;
        res.render('otp',{OtpUserId});
    } catch (error) {
        console.log(error.message);  
        res.status(500).render('Error-500');
    }
};

//verify otp post route
const verifyuserOtp=async (req,res)=>{
    try {
        console.log('::::::::ok,reached verifyOtp post route:::::');
        // console.log('userId of otp stored in session:'+JSON.stringify(req.session));
        // const userId=req.session.user;
        // const userId=req.params.id;
        // console.log(`userId:${userId}`);

        const {num1,num2,num3,num4,otpUserId}=req.body;
        // console.log(num1,num2,num3,num4);
        const otp=`${num1}${num2}${num3}${num4}`

        console.log(`userEntered OTP through body:${otp}`);
        const userId=otpUserId;

        if(!userId || !otp){
            res.json({otp:'noRecord',message:'no records found'})
        }else{
            const otpRecords=await userOtpVerfication.findOne({userId});
            console.log("otpRecords: ",otpRecords);

            if(otpRecords.length<=0){
                // throw new Error("Account has been already verified or record is already exist .please sign up or login");
                res.json({otp:false,message:'Account has been already verified or record is already exist .please sign up or login'});
            }else{
                const {expiresAt}=otpRecords; 
                const hashedOtp=otpRecords.otp;
                console.log(`expiresAt:${expiresAt} & date.now:${Date.now()}`);
                
                if(expiresAt<Date.now()){
                    //if time limit exceeded
                    await userOtpVerfication.deleteMany({userId});
                    res.json({otp:'expired',message:'otp code time limit exceeded, please try again'});

                }else{
                    const matchedOtp=await bcrypt.compare(otp,hashedOtp);
                    if(!matchedOtp){

                        res.status(200).json({otp:'invalid',message:'please provide a valid code'});
                    }else{
                        await User.updateOne({_id:userId},{verified:true});
                        await userOtpVerfication.deleteMany({userId:userId});

                        //acknowledgement for user loggedin
                        req.session.userId=userId;

                        console.log('successfull otp verification');
                        // res.redirect('/home')
                        res.status(200).json({otp:true})
                    }
                }  
            }
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}
//resend the otp
const resendOtp=async (req,res)=>{
    try {

        console.log(':::::::::::ok, reached resend otp method::::::::::::::');
        const userId=req.query.id;
        console.log("query id is here "+userId);

        await userOtpVerfication.deleteMany({userId:userId});

        const userData=await User.findOne({_id:userId});
        console.log("userData:"+userData);
        if(userData){
            await otpVerificationEmail(userData,req,res);
        }else{
            res.json({otp:'invalid'})
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }

}
//logout route
const userLogout=async (req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                console.log(err.message);
            }else{
                console.log('user session destroyed');
            }
        })
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}


// //forgot password 
// const loadForgotPassword=async (req,res)=>{
//     try {
//         res.render('forgetPassword');

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).render('Error-500');
//     }
// }

// const forgetPassword=async (req,res)=>{
//     try {

//         const {email}=req.body;
//         console.log('emial through body:',email);
//         const emailUserDetails=await User.findOne({email:email});
//         console.log('emailUserDetails:',emailUserDetails);

//         if(emailUserDetails){
//             const userId=emailUserDetails._id;
//             otpVerificationEmail(emailUserDetails, req, res);
//             res.redirect(`/verifyOtp?id=${userId}`);
//         }else{
//             res.render('forgetPassword',{message:'email not found'});
//         }

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).render('Error-500');
//     }
// }



module.exports={
    loadHomePage,
    loadAbout,
    loginLoad,
    registerLoad,
    insertUser,
    loadShop,
    loadOtpPage,
    verifyuserOtp,
    loadProfile,
    resendOtp,
    loginCheck,
    loadProductDetails,
    userLogout,
    loadBlogPage,
    loadContactPage,
    editProfile,
    otpVerificationEmail
    
}