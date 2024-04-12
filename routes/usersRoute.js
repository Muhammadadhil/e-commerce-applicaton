const express = require('express');
const router = express();
const userController=require('../controller/userController');
const cartController=require('../controller/cartController');
const userHelpController=require('../controller/userHelpController');
const addressController=require('../controller/addressController');
const orderController=require('../controller/orderController');
const auth=require('../middleware/auth');
const {validateAddress}=require('../middleware/validate');
const couponController=require('../controller/couponController');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

//home page
router.get('/',auth.isUserBlocled,userController.loadHomePage);
router.get('/about',auth.isUserBlocled,userController.loadAbout);

//account 
router.get('/account',auth.isUserBlocled,auth.isLogin,userController.loadAccount);
router.post('/editProfile',auth.isUserBlocled,auth.isLogin,userController.editProfile);


//shop and details shop
router.get('/shop',auth.isUserBlocled,userController.loadShop);
router.get('/productDetails',auth.isUserBlocled,userController.loadProductDetails);
router.get('/search',userController.searchProducts);


//blog
router.get('/blog',auth.isUserBlocled,userController.loadBlogPage);

//contact
router.get('/contact',auth.isUserBlocled,userController.loadContactPage);

//cart
router.get('/cart',auth.isUserBlocled,auth.isLogin,cartController.loadCartPage);
router.post('/addToCart',auth.isLogin,cartController.addProductsToCart);
router.patch('/removeFromCart',auth.isLogin,cartController.removeProduct);

//login
router.get('/login',auth.isLogout,auth.isUserBlocled,userController.loginLoad);
router.post('/login',userController.loginCheck);

//register
router.get('/register',auth.isUserBlocled,auth.isLogout,userController.registerLoad);
router.post('/register',userController.insertUser);

//forget password
router.get('/forgetPassword',auth.isLogout,userHelpController.loadForgotPassword);
router.post('/forgetPassword',userHelpController.forgetPassword);
router.get('/forgetPasswordOtp/:id',auth.isLogout,userHelpController.loadOtp);
router.post('/forgetPasswordOtpVerify',userHelpController.verifyOtp);
router.get('/newPassword',auth.isLogout,userHelpController.loadNewPassword);
router.post('/newPassword',auth.isLogout,userHelpController.updateNewPassword);

//otp 
router.get('/verifyOtp',auth.isUserBlocled,auth.isLogout,userController.loadOtpPage);
router.post('/verifyOtp',userController.verifyuserOtp);
router.get('/resendOtp',auth.isLogout,userController.resendOtp);

//address
router.post('/addAddress',auth.isLogin,validateAddress,addressController.addAddress);
router.post('/getAddress',auth.isLogin,addressController.getAddress);
router.post('/editAddress',auth.isLogin,validateAddress,addressController.editAddress);
router.post('/removeAddress',auth.isLogin,addressController.removeAddress);

//checkout
router.get('/checkout',auth.isLogin,orderController.loadCheckoutPage);

//order
router.post('/placeOrder',auth.isLogin,orderController.placeOrder);
router.get('/orderSuccess',auth.isLogin,orderController.loadSuccessPage);
router.get('/detailsOrder',auth.isLogin,orderController.loadOrderDetails);
router.post('/cancelProductOrder',orderController.cancelProductOrder);
router.post('/verifyPayment',orderController.verifyOnlinePayment);
router.post('/returnProduct',orderController.returnProductOrder);
router.get('/paytheAmount',auth.isLogin,orderController.payAgain);




//coupon
router.get('/applyCoupon',auth.isLogin,couponController.verifyCoupon);
router.post('/removeCoupon',auth.isLogin,couponController.removeCoupon);

//wishlist
router.get('/wishlist',auth.isLogin,userHelpController.loadWishlist);
router.post('/addTowishlist',auth.isLogin,userHelpController.addItemToWishlist);
router.get('/removeItemFromWishlist',auth.isLogin,userHelpController.removeFromWishlist);

//logout
router.get('/logout',userController.userLogout);







module.exports = router;


