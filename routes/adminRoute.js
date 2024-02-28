const express = require('express');
const { route } = require('./usersRoute');
const router = express();
const upload=require('../middleware/multer');
const adminController=require('../controller/adminController');
const productController=require('../controller/productController');


router.set('views','./views/admin');

router.get('/',adminController.loginLoad);
router.post('/login',adminController.verifyAdmin);
router.get('/home',adminController.loadHome);

//customers or users route
router.get('/customers',adminController.loadCustomers);
router.patch('/blockAndUnblock',adminController.userBlock);

//category routes
router.get('/category',adminController.loadCategory);
router.post('/addCategory',adminController.addCategory);
router.get('/editCategory',adminController.editCategory);
router.post('/editCategory',adminController.updateCategory);
router.post('/deleteCategory',adminController.deleteCategory);

//product routes
router.get('/products',productController.loadProducts);
router.get('/addProducts',productController.loadAddProducts);
router.post('/addProducts',upload.array('images',4),productController.addProducts);
router.get('/editProducts',productController.loadEditProduct);
router.post('/editProducts',upload.array('images',4),productController.updateProducts);
router.patch('/productBlockUnblock',productController.blockProduct);












module.exports = router;