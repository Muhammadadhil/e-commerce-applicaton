
const User=require('../model/userModel');
const userOtpVerfication=require('../model/userOtpVerfication');
const userController=require('../controller/userController')
const bcrypt=require('bcrypt');


//load forgot password 
const loadForgotPassword=async (req,res)=>{
    try {
        res.render('forgetPassword');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//forget password post 
const forgetPassword=async (req,res)=>{
    try {
        const {email}=req.body;
        console.log('emial through body:',email);
        const emailUserDetails=await User.findOne({email:email});
        console.log('emailUserDetails:',emailUserDetails);

        if(emailUserDetails){
            const userId=emailUserDetails._id;
            res.redirect(`/forgetPasswordOtp/${userId}`);
            await userController.otpVerificationEmail(emailUserDetails, req, res);
        }else{
            res.render('forgetPassword',{message:'email not found'});
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//load the otp page 
const loadOtp=async (req,res)=>{
    try {
        const userId=req.params.id;
        res.render('OtpforgetPassword',{userId});

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//verify user entered otp
const verifyOtp=async (req,res)=>{
    try {
        console.log(':::::reached forget password otp verify post::::');

        const {num1,num2,num3,num4,otpUserId}=req.body;
        // console.log(num1,num2,num3,num4);
        const otp=`${num1}${num2}${num3}${num4}`

        // console.log(`userEntered OTP through body:${otp}`);
        const userId=otpUserId;

        if(!userId || !otp){
            res.json({otp:'noRecord',message:'no records found'})
        }else{
            const otpRecords=await userOtpVerfication.findOne({userId});
            console.log("otpRecords: ",otpRecords);

            if(!otpRecords){
                // throw new Error("Account has been already verified or record is already exist .please sign up or login");
                res.json({otp:false,message:'Account has been already verified or record is already exist .please sign up or login'});
            }else{
                const {expiresAt}=otpRecords; 
                const hashedOtp=otpRecords.otp;
                // console.log(`expiresAt:${expiresAt} & date.now:${Date.now()}`);
                
                if(expiresAt<Date.now()){
                    //if time limit exceeded
                    await userOtpVerfication.deleteMany({userId});
                    res.json({otp:'expired',message:'otp code time limit exceeded, please try again'});

                }else{
                    const matchedOtp=await bcrypt.compare(otp,hashedOtp);
                    if(!matchedOtp){

                        res.status(200).json({otp:'invalid',message:'please provide a valid code'});
                    }else{
                        res.render('newPassword');
                        res.redirect('/newPassword');
                    }
                }  
            }
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}

//load new password page
const loadNewPassword= async (req,res)=>{
    try {

        console.log('reached load new password method!!!!');
        res.render('newPassword')
        // res.send('hiii')
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}
module.exports={
    loadForgotPassword,
    forgetPassword,
    loadOtp,
    verifyOtp,
    loadNewPassword
}