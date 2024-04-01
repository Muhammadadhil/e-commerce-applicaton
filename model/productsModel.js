
const { ObjectId, Timestamp } = require('mongodb');
const mongoose=require('mongoose');
// const categoryModel=require('./categoryModel');

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    images:{
        image1:{
            type:String,
            required:true
        },
        image2:{
            type:String,
            required:true
        },
        image3:{
            type:String,
            required:true
        },
        image4:{
            type:String,
            required:true
        }
    },
    // addedDate:{
    //     type:Date,
    //     required:true
    // },
    description:{
        type:String,
        required:true
    },
    categoryId:{
        type:ObjectId,
        required:true,
        ref:'Category'
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    isCategoryBlocked:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

module.exports=mongoose.model('products',productSchema);
