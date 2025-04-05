const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userOtpVerificationSchema=new Schema({
    userId:String,
    otp:String,
    expiresAt:Date,

});

userOtpVerificationSchema.index({createdAt:1},{expireAfterSeconds:60})
module.exports=mongoose.model('userOtpVerification',userOtpVerificationSchema);

