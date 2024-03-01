const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userOtpVerificationSchema=new Schema({
    userId:String,
    otp:String,
    expiresAt:{
        type:Date,
        default:Date.now()+60*1000},
},{
    timestamps:true
});

userOtpVerificationSchema.index({createdAt:1},{expireAfterSeconds:60})
module.exports=mongoose.model('userOtpVerification',userOtpVerificationSchema);

