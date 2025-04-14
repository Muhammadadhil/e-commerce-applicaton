const { ObjectId, Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        orgPrice: {
            type: Number,
        },
        quantity: {
            type: Number,
            required: true,
        },
        images: {
            image1: {
                type: String,
                required: true,
            },
            image2: {
                type: String,
                required: true,
            },
            image3: {
                type: String,
                required: true,
            },
            image4: {
                type: String,
                required: true,
            },
        },
        description: {
            type: String,
            required: true,
        },
        categoryId: {
            type: ObjectId,
            required: true,
            ref: "Category",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isCategoryBlocked: {
            type: Boolean,
            default: false,
        },
        //offer
        productOfferId: {
            type: ObjectId,
            ref: "Offer",
        },
        categoryOfferId: {
            type: ObjectId,
            ref: "Offer",
        },
        productDiscount: {
            type: Number,
        },
        categoryDiscount: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("products", productSchema);
