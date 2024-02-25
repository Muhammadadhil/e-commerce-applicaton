const express = require('express');
const router = express();
const userController=require('../controller/userController');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

router.get('/',userController.loadHomePage)

router.get('/about',userController.loadAbout);
router.get('/shop',userController.loadShop);

router.get('/login',userController.loginLoad);
router.post('/login',userController.loginCheck);

router.get('/register',userController.registerLoad);
router.post('/register',userController.insertUser);

router.get('/verifyOtp',userController.loadOtpPage);
router.post('/verifyOtp',userController.verifyuserOtp);

router.get('/resendOtp',userController.resendOtp);

router.get('/profile',userController.loadProfile);


module.exports = router;


