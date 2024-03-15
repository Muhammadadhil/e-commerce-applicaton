const express = require('express');
const router = express();
const userController=require('../controller/userController');
const cartController=require('../controller/cartController');
const userHelpController=require('../controller/userHelpController');
const addressController=require('../controller/addressController');
const orderController=require('../controller/orderController');
const auth=require('../middleware/auth');
const {validateAddress}=require('../middleware/validate');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

//home page
router.get('/',auth.isUserBlocled,userController.loadHomePage);
router.get('/about',auth.isUserBlocled,userController.loadAbout);

//account
router.get('/account',auth.isUserBlocled,auth.isLogin,userController.loadAccount);
router.post('/editProfile',auth.isUserBlocled,userController.editProfile);


//shop and details shop
router.get('/shop',auth.isUserBlocled,userController.loadShop);
router.get('/productDetails',auth.isUserBlocled,userController.loadProductDetails);

//blog
router.get('/blog',auth.isUserBlocled,userController.loadBlogPage);

//contact
router.get('/contact',auth.isUserBlocled,userController.loadContactPage);

//cart
router.get('/cart',auth.isUserBlocled,auth.isLogin,cartController.loadCartPage);
router.post('/addToCart',cartController.addProductsToCart);
router.patch('/removeFromCart',cartController.removeProduct);

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
router.post('/newPassword',userHelpController.updateNewPassword);

//otp 
router.get('/verifyOtp',auth.isUserBlocled,auth.isLogout,userController.loadOtpPage);
router.post('/verifyOtp',userController.verifyuserOtp);
router.get('/resendOtp',auth.isLogout,userController.resendOtp);

//address
router.post('/addAddress',validateAddress,addressController.addAddress);
router.post('/getAddress',addressController.getAddress);
router.post('/editAddress',addressController.editAddress);
router.post('/removeAddress',addressController.removeAddress);

//checkout
router.get('/checkout',auth.isLogin,orderController.loadCheckoutPage);
router.post('/placeOrder',orderController.placeOrder);
router.get('/orderSuccess',orderController.loadSuccessPage);



//logout
router.get('/logout',userController.userLogout);







module.exports = router;


