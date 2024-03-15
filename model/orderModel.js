const { date } = require('joi');
const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const orderSchema=mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true,
        ref:'User'
    },
    products:[{
        productId:{
            type:ObjectId,
            required:true,
            ref:'products'
        },
        quantity:{
            type:Number,
            required:true,
        },
        price:{
            type:Number,
            required:true,
            default:0
        },
        totalPrice:{
            type:Number,
            required:true,
            default:0
        },
        productStatus:{
            type:String,
            required:true
        }
    }],
    deliveryAddress:{
        type:Object,
        required:true,
    },
    payment:{
        type:String,
        required:true
    },
    orderDate:{
        type:Date,
        required:true
    },
    cancelReason:{
        type:String
    },
    returnReason:{
        type:String
    },
    orderStatus:{
        type:String,
        default:'Pending'
    },
    subTotal:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('Order',orderSchema);