const express = require('express');
const router = express();
const userController=require('../controller/userController');
const auth=require('../middleware/auth');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

router.get('/',userController.loadHomePage);
router.get('/about',userController.loadAbout);
router.get('/shop',userController.loadShop);
router.get('/productDetails',userController.loadProductDetails);
router.get('/login',auth.isLogout,userController.loginLoad);
router.get('/register',auth.isLogout,userController.registerLoad);
router.get('/verifyOtp',auth.isLogout,userController.loadOtpPage);
router.get('/resendOtp',auth.isLogout,userController.resendOtp);
router.get('/profile',auth.isLogin,userController.loadProfile);
router.get('/logout',userController.userLogout);



router.post('/login',userController.loginCheck);
router.post('/register',userController.insertUser);
router.post('/verifyOtp',userController.verifyuserOtp);




module.exports = router;


