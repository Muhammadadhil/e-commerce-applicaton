//importing models
const User=require('../model/userModel');
const userOtpVerfication=require('../model/userOtpVerfication');

//importing bcrupt-for hashing
const bcrypt=require('bcrypt');

//importing nodemailer
const nodemailer=require('nodemailer');
// const dotenv=require('')



//loading home page
const loadHomePage=(req,res)=>{
    try {
        const user=req.session.userId;
        console.log(`hello aadhi,this is user : ${user}`);
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
//load profle
const loadProfile=async (req,res)=>{
    try {
        res.render('profile');
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
const insertUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password} = req.body;
        console.log(`firstname:${firstName} lastname:${lastName} emial:${email}`);
        console.log("body : ", req.body);

        //securing the password
        const securePassword = await hashPassword(password, 10);
        console.log(securePassword);

        const user = new User({
            firstName: firstName,
            lastname: lastName,
            email: email,
            password: securePassword,
            verified: false,
        })
        console.log(`before saving userdetails:${user}`);
    
        const newUser = await user.save();
        console.log(newUser);
        if (newUser) {
            otpVerificationEmail(newUser, req, res);
            const id=newUser._id
            res.json({ data: true ,id});
        } else {
            res.json({ dataa: false, message: 'not saved!' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: false, message: 'Error saving user details' });
    }
}


//nodemailer-mail transporter
const transpoter=nodemailer.createTransport({
    host:'smtp.gmail.com',     //(Simple Mail Transfer Protocol) 
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:'muhammadadhil934@gmail.com',
        pass:'qjms zuog xjln fmdz'
    }
});

//otp verification
const otpVerificationEmail=async ({_id,email},req,res)=>{
    try {
        console.log('reached otp verification email sending function');
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
            createdAt:Date.now(),
            expiresAt:Date.now()+60000
        })

        //save the otp in database
        await newOtpVerification.save();
        //send the mail
        await transpoter.sendMail(mailOptions);
        

        // req.session.user=_id;
        // console.log("req.session :",req.session.user);
        // res.redirect('/verifyOtp');
        
        
    } catch (error) {
        console.log("error : ",error);
        // res.json({
        //     status:"failed",
        //     message:error.message
        // });
    }
};

//load verification page
const loadOtpPage=async (req,res)=>{
    try {
        console.log(`params: ${req.params.id}`);
        const OtpUserId=req.params.id;
        res.render('otp',{OtpUserId});
    } catch (error) {
        console.log(error.message);  
        res.status(500).render('Error-500');
    }
};

//verify otp post route
const verifyuserOtp=async (req,res)=>{
    try {
        console.log('ok,reached verifyOtp post route');
        // console.log('userId of otp stored in session:'+JSON.stringify(req.session));
        // const userId=req.session.user;
        // const userId=req.params.id;
        // console.log(`userId:${userId}`);

        const {num1,num2,num3,num4,otpUserId}=req.body;
        // console.log(num1,num2,num3,num4);
        const otp=`${num1}${num2}${num3}${num4}`

        console.log(`userEntered OTP through body:${otpUserId}`);
        const userId=otpUserId;

        if(!userId || !otp){
            res.json({otp:'noRecord',message:'no records found'})
        }else{
            const otpRecords=await userOtpVerfication.findOne({userId});
            // console.log(otpRecords);

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
                    res.json({otp:'expired',message:'otp code time limit exceeded, please try again later'});

                }else{
                    const matchedOtp=await bcrypt.compare(otp,hashedOtp);
                    if(!matchedOtp){
                        // res.render('otp',{message:'please provide a valid code'})
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
        const id=req.session.OtpUserId;
        console.log(id);
        const userData=await User.findOne({_id:id});
        console.log(userData);
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
    resendOtp

    
}