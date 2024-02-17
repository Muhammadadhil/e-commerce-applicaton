const express = require('express');
const router = express();
const userController=require('../controller/userController');

//setting views path for users
router.set('views','./views/user');

//lading the main page
router.get('/',(req,res)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
})

router.get('/home',userController.loadHomePage)

router.get('/about',userController.loadAbout);
router.get('/login',userController.loginLoad);

router.get('/register',userController.registerLoad);
router.post('/register',userController.insertUser);

router.get('/shop',userController.loadShop);

router.get('/otp',userController.loadOtpPage);





module.exports = router;


