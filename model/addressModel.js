const { string, number } = require("joi");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

const addressSchema=mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true,
        ref:'User'
    },
    address:[
        {
            name:{
                type:String,
                required:true
            },
            landmark:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            phone:{
                type:Number,
                required:true
            },
            address:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            pincode:{
                type:Number,
                required:true
            },
            email:{
                type:String,
                required:true
            }
        }]
})

module.exports= mongoose.model('Address',addressSchema);

