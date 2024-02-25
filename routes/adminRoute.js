const express = require('express');
const { route } = require('./usersRoute');
const router = express();
const adminController=require('../controller/adminController');


router.set('views','./views/admin');

router.get('/',adminController.loginLoad);

router.post('/login',adminController.verifyAdmin);

router.get('/home',adminController.loadHome);

router.get('/customers',adminController.loadCustomers);

router.patch('/blockAndUnblock',adminController.userBlock);

router.get('/category',adminController.loadCategory);

router.post('/addCategory',adminController.addCategory);

router.get('/editCategory',adminController.editCategory);
router.post('/editCategory',adminController.updateCategory);

router.post('/deleteCategory',adminController.deleteCategory);









module.exports = router;