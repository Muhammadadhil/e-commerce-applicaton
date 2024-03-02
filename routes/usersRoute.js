const express = require('express');
const router = express();
const userController=require('../controller/userController');
const auth=require('../middleware/auth');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

//home page
router.get('/',userController.loadHomePage);
router.get('/about',userController.loadAbout);

//profile
router.get('/profile',auth.isLogin,userController.loadProfile);

//shop and details shop
router.get('/shop',userController.loadShop);
router.get('/productDetails',userController.loadProductDetails);

//login
router.get('/login',auth.isLogout,userController.loginLoad);
router.post('/login',userController.loginCheck);

//register
router.get('/register',auth.isLogout,userController.registerLoad);
router.post('/register',userController.insertUser);

//otp 
router.get('/verifyOtp',auth.isLogout,userController.loadOtpPage);
router.post('/verifyOtp',userController.verifyuserOtp);
router.get('/resendOtp',auth.isLogout,userController.resendOtp);

//logout
router.get('/logout',userController.userLogout);







module.exports = router;


