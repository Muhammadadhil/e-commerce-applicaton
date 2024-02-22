const express = require('express');
const { route } = require('./usersRoute');
const router = express();
const adminController=require('../controller/adminController');


router.set('views','./views/admin');

router.get('/',adminController.loginLoad);


module.exports = router;