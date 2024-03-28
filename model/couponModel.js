const mongoose=require('mongoose');

const couponSchema=mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discountAmount:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    criteriaAmount:{
        type:String,
        required:true
    },
    useLimit:{
        type:Number,
        required:true
    },
    usedUser:{
        type:Array,
        ref:'User',
        default:[]
    },
    isActive:{
        type:Boolean,
        default:false
    }  
},

    {
        timestamps:true
    }
)
module.exports=mongoose.model('Coupon',couponSchema);