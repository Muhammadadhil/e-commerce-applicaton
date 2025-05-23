const express = require("express");
const router = express();
const userController = require("../controller/userController");
const cartController = require("../controller/cartController");
const userHelpController = require("../controller/userHelpController");
const addressController = require("../controller/addressController");
const orderController = require("../controller/orderController");
const auth = require("../middleware/auth");
const { validateAddress } = require("../middleware/validate");
const couponController = require("../controller/couponController");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//setting views path for users
router.set("views", "./views/user");

//home page
router.get("/", auth.isUserBlocled, userController.loadHomePage);
router.get("/about", auth.isUserBlocled, userController.loadAbout);

//account
router.get("/account", auth.isUserBlocled, auth.isLogin, userController.loadAccount);
router.put("/profile/edit", auth.isUserBlocled, auth.isLogin, userController.editProfile);

//shop and details shop
router.get("/shop", auth.isUserBlocled, userController.loadShop);
router.get("/product/details", auth.isUserBlocled, userController.loadProductDetails);
router.get("/search", userController.searchProducts);

//cart
router.get("/cart", auth.isUserBlocled, auth.isLogin, cartController.loadCartPage);
router.post("/addToCart", auth.isLogin, cartController.addProductsToCart);
router.delete("/cart/:productId", auth.isLogin, cartController.removeProduct);

//login
router.get("/login", auth.isLogout, auth.isUserBlocled, userController.loginLoad);
router.post("/login", userController.loginCheck);

//register
router.get("/register", auth.isUserBlocled, auth.isLogout, userController.registerLoad);
router.post("/register", userController.insertUser);

//forget password
router.get("/forgetPassword", auth.isLogout, userHelpController.loadForgotPassword);
router.post("/forgetPassword", userHelpController.forgetPassword);
router.get("/forgetPasswordOtp/:id", auth.isLogout, userHelpController.loadOtp);
router.post("/forgetPasswordOtpVerify", userHelpController.verifyOtp);
router.get("/newPassword", auth.isLogout, userHelpController.loadNewPassword);
router.post("/newPassword", auth.isLogout, userHelpController.updateNewPassword);

//otp
router.get("/verifyOtp", auth.isUserBlocled, auth.isLogout, userController.loadOtpPage);
router.post("/verifyOtp", userController.verifyuserOtp);
router.get("/resendOtp", auth.isLogout, userController.resendOtp);

//address
router.post("/addAddress", auth.isLogin, validateAddress, addressController.addAddress);
router.post("/getAddress", auth.isLogin, addressController.getAddress);
router.put("/address/edit", auth.isLogin, validateAddress, addressController.editAddress);
router.delete("/address/:addressId", auth.isLogin, addressController.removeAddress);

//checkout
router.get("/checkout", auth.isLogin, orderController.loadCheckoutPage);

//order
router.post("/placeOrder", auth.isLogin, orderController.placeOrder);
router.get("/orderSuccess", auth.isLogin, orderController.loadSuccessPage);
router.get("/orderFailure", auth.isLogin, orderController.loadFailurePage);
router.get("/detailsOrder", auth.isLogin, orderController.loadOrderDetails);
router.delete("/order/:orderId/:productId", orderController.cancelProductOrder);
router.post("/verifyPayment", orderController.verifyOnlinePayment);
router.delete("/returnProduct", orderController.returnProductOrder);  
router.get("/paytheAmount", auth.isLogin, orderController.payAgain);

//invoice
router.get("/salesInvoice", auth.isLogin, userHelpController.loadInvoice);

//coupon
router.get("/applyCoupon", auth.isLogin, couponController.verifyCoupon);
router.post("/removeCoupon", auth.isLogin, couponController.removeCoupon);

//wishlist
router.get("/wishlist", auth.isLogin, userHelpController.loadWishlist);
router.post("/addTowishlist", auth.isLogin, userHelpController.addItemToWishlist);
router.delete("/wishlist/:itemId", auth.isLogin, userHelpController.removeFromWishlist);

//logout
router.get("/logout", userController.userLogout);

module.exports = router;
