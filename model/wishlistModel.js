const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const wishlistSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    products: [
        {
            productId: {
                type: ObjectId,
                required: true,
                ref: "Products",
            },
        },
    ],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
