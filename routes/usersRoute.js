const express = require('express');
const router = express();
const userController=require('../controller/userController');

router.use(express.json());
router.use(express.urlencoded({extended:true}));

//setting views path for users
router.set('views','./views/user');

//lading the main page
router.get('/',(req,res)=>{
    try {   
        
        res.render('home')
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500')
    }
})

router.get('/home',userController.loadHomePage)

router.get('/about',userController.loadAbout);
router.get('/shop',userController.loadShop);

router.get('/login',userController.loginLoad);

router.get('/register',userController.registerLoad);
router.post('/register',userController.insertUser);

router.get('/verifyOtp',userController.loadOtpPage);
router.post('/verifyOtp',userController.verifyuserOtp);




module.exports = router;


