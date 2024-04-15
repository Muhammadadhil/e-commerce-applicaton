const express = require('express');
const { route } = require('./usersRoute');
const router = express();
const upload=require('../middleware/multer');
const auth=require('../middleware/auth');
const adminController=require('../controller/adminController');
const productController=require('../controller/productController');
const couponController=require('../controller/couponController');
const offerController=require('../controller/offerController');
// const orderController=require('../controller/orderController');


router.set('views','./views/admin');

router.get('/',auth.isAdminLogout,adminController.loginLoad);
router.post('/login',adminController.verifyAdmin);
router.get('/home',auth.isAdminLogin,adminController.loadDashBoard);
router.get('/logout',adminController.adminLogout);

//customers or users route
router.get('/customers',auth.isAdminLogin,adminController.loadCustomers);
router.patch('/blockAndUnblock',auth.isAdminLogin,adminController.userBlock);

//category routes
router.get('/category',auth.isAdminLogin,adminController.loadCategory);
router.post('/addCategory',auth.isAdminLogin,adminController.addCategory);
router.get('/editCategory',auth.isAdminLogin,adminController.editCategory);
router.post('/editCategory',auth.isAdminLogin,adminController.updateCategory);
router.post('/blockUnblock',auth.isAdminLogin,adminController.blockCategory);

//product routes
router.get('/products',auth.isAdminLogin,productController.loadProducts);
router.get('/addProducts',auth.isAdminLogin,productController.loadAddProducts);
router.post('/addProducts',upload.array('images',4),auth.isAdminLogin,productController.addProducts);
router.get('/editProducts',auth.isAdminLogin,productController.loadEditProduct);

const imgUploads=upload.fields([{name:'image1'},{name:'image2'},{name:'image3'},{name:'image4'}]);
router.post('/editProducts',imgUploads,productController.updateProducts);
router.patch('/productBlockUnblock',auth.isAdminLogin,productController.blockProduct);


//order routes
router.get('/orders',auth.isAdminLogin,adminController.loadOrderList);
router.get('/orderDetails',auth.isAdminLogin,adminController.loadOrderDetails);
router.post('/changeOrderStatus',adminController.changeOrderStatus);
router.post('/getChartData',auth.isAdminLogin,adminController.chartData);


//coupons
router.get('/coupons',auth.isAdminLogin,couponController.listCoupons);
router.get('/addCoupons',auth.isAdminLogin,couponController.addCoupons);
router.post('/addCoupons',auth.isAdminLogin,couponController.saveCoupons);
router.get('/editCoupon',auth.isAdminLogin,couponController.editCoupon);
router.post('/editCoupons',auth.isAdminLogin,couponController.saveEditCoupon);
router.get('/deleteCoupon',auth.isAdminLogin,couponController.deleteCoupon);

//sales report
router.get('/salesReport',auth.isAdminLogin,adminController.loadSalesReport);

//offers
router.get('/offers',auth.isAdminLogin,offerController.offerLoader);
router.get('/addOffer',auth.isAdminLogin,offerController.addOfferLoader);
router.post('/addOffer',auth.isAdminLogin,offerController.addOffer)
router.patch('/removeOffer',auth.isAdminLogin,offerController.removeOffer);
router.patch('/reactivateOffer',auth.isAdminLogin,offerController.reactivateOffer)






module.exports = router;