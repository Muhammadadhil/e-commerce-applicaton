const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    walletAmount: {
        type: Number,
        default: 0,
    },
    walletHistory: [
        {
            amount: {
                type: Number,
                default: 0,
            },
            description: {
                type: String,
            },
            date: {
                type: Date,
            },
        },
    ],
});
module.exports = mongoose.model("User", userSchema);
