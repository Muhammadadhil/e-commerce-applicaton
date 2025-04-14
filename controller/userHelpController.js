const User = require("../model/userModel");
const userOtpVerfication = require("../model/userOtpVerfication");
const userController = require("../controller/userController");
const bcrypt = require("bcrypt");
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");
const Orders = require("../model/orderModel");

//load forgot password
const loadForgotPassword = async (req, res) => {
    try {
        res.render("forgetPassword");
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//forget password post
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const emailUserDetails = await User.findOne({ email: email });
        if (emailUserDetails) {
            const userId = emailUserDetails._id;
            res.redirect(`/forgetPasswordOtp/${userId}`);
            await userController.otpVerificationEmail(emailUserDetails, req, res);
        } else {
            res.render("forgetPassword", { message: "email not found" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//load the otp page
const loadOtp = async (req, res) => {
    try {
        const userId = req.params.id;
        res.render("OtpforgetPassword", { userId });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//verify user entered otp
const verifyOtp = async (req, res) => {
    try {
        const { num1, num2, num3, num4, otpUserId } = req.body;
        const otp = `${num1}${num2}${num3}${num4}`;
        const userId = otpUserId;

        if (!userId || !otp) {
            res.json({ otp: "noRecord", message: "no records found" });
        } else {
            const otpRecords = await userOtpVerfication.findOne({ userId });
            console.log("otpRecords: ", otpRecords);

            if (!otpRecords) {
                res.json({ otp: false, message: "cannot find email id details" });
            } else {
                const { expiresAt } = otpRecords;
                const hashedOtp = otpRecords.otp;

                if (expiresAt < Date.now()) {
                    //if time limit exceeded
                    await userOtpVerfication.deleteMany({ userId });
                    res.json({ otp: "expired", message: "otp code time limit exceeded, please try again" });
                } else {
                    const matchedOtp = await bcrypt.compare(otp, hashedOtp);
                    if (!matchedOtp) {
                        res.status(200).json({ otp: "invalid", message: "please provide a valid code" });
                    } else {
                        await userOtpVerfication.deleteMany({ userId });
                        res.status(200).json({ success: true });
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//load new password page
const loadNewPassword = async (req, res) => {
    try {
        const userId = req.query.id;
        res.render("newPassword", { userId });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//update new password post
const updateNewPassword = async (req, res) => {
    try {
        const { password, userId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateData = await User.findOneAndUpdate({ _id: userId }, { $set: { password: hashedPassword } });
        if (updateData) {
            req.session.userId = userId;
            res.redirect("/");
        } else {
            res.render("newPassword", { message: "failed to save new password" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

const loadWishlist = async (req, res) => {
    try {
        const user = req.session.userId;
        const populateOption = {
            path: "products.productId",
            model: "products",
        };
        const cartDetails = await Cart.findOne({ userId: user });
        const itemsCount = cartDetails?.product.length;
        const wishlist = await Wishlist.findOne({ userId: user }).populate(populateOption);
        res.render("wishlist", { wishlist, user, itemsCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

const addItemToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userId;

        const exist = await Wishlist.findOne({ userId: userId, "products.productId": productId });

        if (exist) {
            await Wishlist.findOneAndUpdate(
                { userId: userId },
                {
                    $set: { userId: userId },
                    $pull: {
                        products: {
                            productId: productId,
                        },
                    },
                },
                { upsert: true, new: true }
            );
            res.json({ removed: true });
        } else {
            await Wishlist.findOneAndUpdate(
                { userId: userId },
                {
                    $set: { userId: userId },
                    $push: {
                        products: {
                            productId: productId,
                        },
                    },
                },
                { upsert: true, new: true }
            );
            res.json({ added: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//remove item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.itemId;
        const userId = req.session.userId;
        const updatedWishlist = await Wishlist.findOneAndUpdate({ userId: userId }, { $pull: { products: { productId: productId } } });
        res.json({ removed: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//invoice
const loadInvoice = async (req, res) => {
    try {
        const orderId = req.query.id;
        const populateOption = [
            {
                path: "products.productId",
                model: "products",
            },
        ];
        const order = await Orders.findOne({ _id: orderId }).populate(populateOption);
        res.render("invoice", { order });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

module.exports = {
    loadForgotPassword,
    forgetPassword,
    loadOtp,
    verifyOtp,
    loadNewPassword,
    updateNewPassword,
    loadWishlist,
    addItemToWishlist,
    removeFromWishlist,
    loadInvoice,
};
