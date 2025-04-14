const User = require("../model/userModel");
const Products = require("../model/productsModel");
const userOtpVerfication = require("../model/userOtpVerfication");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Cart = require("../model/cartModel");
const Category = require("../model/categoryModel");
const Wishlist = require("../model/wishlistModel");

// const dotenv=require('')
const { registerationSchema } = require("../middleware/validate");
const { date } = require("joi");

//getting cart items count
const getCartDetails = async (userId) => {
    try {
        const cartDetails = await Cart.findOne({ userId: userId });
        const itemsCount = cartDetails?.product.length;
        return { itemsCount, cartDetails };
    } catch (error) {
        throw new Error(err.message);
    }
};

//loading home page
const loadHomePage = async (req, res) => {
    try {
        const user = req.session.userId;
        const { itemsCount } = await getCartDetails(user);
        res.render("home", { user, itemsCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
//secure password using bcrypt
const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        console.log(error.message);
    }
};

//login the about page
const loadAbout = async (req, res) => {
    try {
        const user = req.session.userId;
        const { itemsCount } = await getCartDetails(user);
        res.render("about", { user, itemsCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//loading the login page
const loginLoad = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//loading register page
const registerLoad = async (req, res) => {
    try {
        res.render("register");
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
//load account
const loadAccount = async (req, res) => {
    try {
        const user = req.session.userId;
        const userData = await User.findById({ _id: user });
        const address = await Address.findOne({ userId: user });
        const userOrders = await Order.find({ userId: user }).sort({ orderDate: -1 });
        const { itemsCount } = await getCartDetails(user);
        const dateOption = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
        userData.walletHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.render("account", { user, itemsCount, userData, address, userOrders, dateOption });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//edit profile post
const editProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const userId = req.session.userId;
        const updateData = await User.findByIdAndUpdate({ _id: userId }, { $set: { firstName: firstName, lastname: lastName } });
        if (updateData) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//loading the shop page
const loadShop = async (req, res) => {
    try {
        const user = req.session.userId;

        // Get current query parameters
        const currentSort = req.query.sort || "";
        const currentFilter = req.query.filter || "allCategory";
        const page = Number(req.query.page) || 1;

        // Handle sorting
        let sortOption = {};
        switch (currentSort) {
            case "3":
                sortOption = { createdAt: -1 };
                break;
            case "4":
                sortOption = { price: 1 };
                break;
            case "5":
                sortOption = { price: -1 };
                break;
            case "6":
                sortOption = { name: 1 };
                break;
            case "7":
                sortOption = { name: -1 };
                break;
        }

        // Handle filtering
        let filterQuery = {};
        if (currentFilter && currentFilter !== "allCategory") {
            filterQuery = { categoryId: currentFilter };
        }

        // Set up pagination
        const limit = 6;
        const products = await Products.find(filterQuery)
            .populate("categoryId")
            .sort(sortOption)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const productsCount = await Products.find(filterQuery).countDocuments();
        const pagesCount = Math.ceil(productsCount / limit);

        // Calculate pagination values
        const nextPage = page * limit < productsCount ? page + 1 : page;
        const previousPage = page > 1 ? page - 1 : 1;

        // Get other data needed for the view
        const categories = await Category.find();
        const wishlist = await Wishlist.findOne({ userId: user }, { "products.productId": 1, _id: 0 });
        const { itemsCount } = await getCartDetails(user);

        // Build pagination URL base to maintain filters and sorting
        const paginationBase = {
            sort: currentSort,
            filter: currentFilter,
        };

        res.render("shop", {
            products,
            user,
            itemsCount,
            categories,
            filterCriteria: currentFilter,
            wishlist,
            pagesCount,
            nextPage,
            previousPage,
            currentSort,
            paginationBase,
            currentPage: page,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//search
const searchProducts = async (req, res) => {
    try {
        const value = req.query.searchKey;
        const regex = new RegExp(value, "i");

        const products = await Products.find({ name: { $regex: regex } }).populate("categoryId");
        res.json({ products });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//product details page load
const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.id;
        const user = req.session.userId;
        const productData = await Products.findOne({ _id: productId }).populate("categoryId");
        const { itemsCount } = await getCartDetails(user);
        res.render("productDetails", { productData, user, itemsCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//login post
const loginCheck = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.isBlocked) {
                res.json({ user: false, message: "your account is blocked by admin" });
            } else {
                const matchPassword = await bcrypt.compare(password, userData.password);
                if (matchPassword) {
                    req.session.userId = userData._id;
                    res.json({ user: true, message: "login successfull" });
                } else {
                    return res.json({ user: false, message: "Incorrect Password" });
                }
            }
        } else {
            res.json({ user: false, message: "Your email or password is incorrect" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//saving the user details
const insertUser = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password } = req.body;
        await User.findOneAndDelete({ email: email, verified: false });
        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {
            return res.json({ status: false, message: "Email already taken" });
        }
        //securing the password
        const securePassword = await hashPassword(password, 10);

        const user = new User({
            firstName: firstName,
            lastname: lastName,
            email: email,
            mobile: mobile,
            password: securePassword,
            verified: false,
            isAdmin: false,
            isBlocked: false,
        });

        const newUser = await user.save();
        if (newUser) {
            otpVerificationEmail(newUser, req, res);
            const id = newUser._id;
            res.json({ status: true, id });
        } else {
            res.json({ status: false, message: "not saved!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Error saving user details" });
    }
};

//nodemailer-mail transporter
const transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com", //(Simple Mail Transfer Protocol)
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
    },
});

//otp verification
const otpVerificationEmail = async ({ _id, email }, req, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 900)}`;
        console.log(" Generated OTP:" + otp);

        //mail option
        const mailOptions = {
            from: "muhammadadhil934@gmail.com",
            to: email,
            subject: "Two factor Authentication",
            html: `
            <html>
                <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <h1 style="color: #333;">Verify Your Email Address</h1>
                        <p style="color: #555; line-height: 1.5;">Enter the following OTP code to verify your email address. This code will expire in 1 minutes:</p>
                        <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
                        <p style="color: #555; line-height: 1.5;">If you did not request this verification, please ignore this email.</p>
                    </div>
                </body>
            </html>`,
        };
        //hash the otp
        const saltRounds = 10;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);

        const newOtpVerification = await new userOtpVerfication({
            userId: _id,
            otp: hashedOtp,
            expiresAt: Date.now() + 60000,
        });

        //save the otp in database
        await newOtpVerification.save();
        //send the mail
        await transpoter.sendMail(mailOptions);
    } catch (error) {
        console.log("error : ", error);
        res.status(500).render("Error-500");
    }
};

//load verification page
const loadOtpPage = async (req, res) => {
    try {
        const OtpUserId = req.query.id;
        res.render("otp", { OtpUserId });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

//verify otp post route
const verifyuserOtp = async (req, res) => {
    try {
        const { num1, num2, num3, num4, otpUserId } = req.body;
        const otp = `${num1}${num2}${num3}${num4}`;

        const userId = otpUserId;

        if (!userId || !otp) {
            res.json({ otp: "noRecord", message: "no records found" });
        } else {
            const otpRecords = await userOtpVerfication.findOne({ userId });
            console.log("otpRecords: ", otpRecords);

            if (otpRecords.length <= 0) {
                res.json({ otp: false, message: "Account has been already verified or record is already exist .please sign up or login" });
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
                        await User.updateOne({ _id: userId }, { verified: true });
                        await userOtpVerfication.deleteMany({ userId: userId });

                        //acknowledgement for user loggedin
                        req.session.userId = userId;

                        console.log("successfull otp verification");
                        // res.redirect('/home')
                        res.status(200).json({ otp: true });
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
//resend the otp
const resendOtp = async (req, res) => {
    try {
        const userId = req.query.id;
        await userOtpVerfication.deleteMany({ userId: userId });
        const userData = await User.findOne({ _id: userId });
        if (userData) {
            await otpVerificationEmail(userData, req, res);
        } else {
            res.json({ otp: "invalid" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};
//logout route
const userLogout = async (req, res) => {
    try {
        delete req.session.userId;
        res.redirect("/");
    } catch (error) {
        console.log(error.message);
        res.status(500).render("Error-500");
    }
};

module.exports = {
    loadHomePage,
    loadAbout,
    loginLoad,
    registerLoad,
    insertUser,
    loadShop,
    loadOtpPage,
    verifyuserOtp,
    loadAccount,
    resendOtp,
    loginCheck,
    loadProductDetails,
    userLogout,
    editProfile,
    otpVerificationEmail,
    searchProducts,
    getCartDetails,
};
