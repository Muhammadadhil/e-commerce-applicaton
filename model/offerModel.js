
const mongoose=require('mongoose');
const offerSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discountPercentage:{
        type:Number,
        required:true
    },
    offerType:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    category:{
        type:String,
        ref:'Category'
    },
    product:{
        type:String,
        ref:'products'
    },
    isActive:{
        type:Boolean,
        default:'true'
    }
},{
    timestamps:true
});

module.exports=mongoose.model('offer',offerSchema);