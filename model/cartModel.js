const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    couponDiscount: {
        type: ObjectId,
        ref: "Coupon",
        default: null,
    },
    product: [
        {
            productId: {
                type: ObjectId,
                required: true,
                ref: "Products",
            },
            quantity: {
                type: Number,
                default: 1,
            },
            // price:{
            //     type:Number,
            //     default:0

            totalPrice: {
                type: Number,
                default: 0,
            },
        },
    ],
});

module.exports = mongoose.model("Cart", cartSchema);
