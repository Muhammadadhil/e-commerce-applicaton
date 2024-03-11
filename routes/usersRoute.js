const express = require('express');
const router = express();
const userController=require('../controller/userController');
const cartController=require('../controller/cartController');
const userHelpController=require('../controller/userHelpController');
const auth=require('../middleware/auth');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

//home page
router.get('/',auth.isUserBlocled,userController.loadHomePage);
router.get('/about',auth.isUserBlocled,userController.loadAbout);

//account
router.get('/account',auth.isUserBlocled,auth.isLogin,userController.loadProfile);
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
router.get('/login',auth.isUserBlocled,userController.loginLoad);
router.post('/login',userController.loginCheck);

//register
router.get('/register',auth.isUserBlocled,auth.isLogout,userController.registerLoad);
router.post('/register',userController.insertUser);

//forget password
router.get('/newPassword',userHelpController.loadNewPassword);
router.get('/forgetPassword',auth.isUserBlocled,userHelpController.loadForgotPassword);
router.post('/forgetPassword',userHelpController.forgetPassword);
router.get('/forgetPasswordOtp/:id',userHelpController.loadOtp);
router.post('/forgetPasswordOtpVerify',userHelpController.verifyOtp);


//otp 
router.get('/verifyOtp',auth.isUserBlocled,auth.isLogout,userController.loadOtpPage);
router.post('/verifyOtp',userController.verifyuserOtp);
router.get('/resendOtp',auth.isLogout,userController.resendOtp);

//logout
router.get('/logout',userController.userLogout);







module.exports = router;


