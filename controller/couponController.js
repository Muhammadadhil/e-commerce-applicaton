const { date } = require('joi');
const Coupon=require('../model/couponModel');
const Cart=require('../model/cartModel');

//coupons list
const listCoupons=async (req,res)=>{
    try {
            const currentDate=new Date();

            const coupons=await Coupon.find({});
            res.render('coupons',{coupons})

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

const addCoupons=async (req,res)=>{
    try {
        res.render('addCoupons');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

//add coupons post
const saveCoupons=async (req,res)=>{
    try {
        console.log('!!!!!!!!! reached save coupons !!!!!!!!!!!!');

        const {couponName,couponCode,discount,activationDate,expiryDate,criteriaAmount}=req.body;
        console.log('expiryDate:',expiryDate);
        console.log('new Date(activationDate):',new Date(activationDate));

        const newCoupon = new Coupon({
            couponName: couponName,
            couponCode: couponCode,
            discountAmount: discount,
            activationDate: new Date(activationDate),
            expiryDate: new Date(expiryDate), 
            criteriaAmount: criteriaAmount,
        });

        newCoupon.save();
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

const editCoupon=async (req,res)=>{
    try {
        const CouponId=req.query.id;
        const couponData=await Coupon.findOne({_id:CouponId});
        res.render('editCoupon',{couponData});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}
//edit post 
const saveEditCoupon=async (req,res)=>{
    try {
        const {couponId,couponName,couponCode,discount,expiryDate,changeExpiryDate,criteriaAmount}=req.body;
        console.log(couponName,couponCode,discount,changeExpiryDate);

        const editedCoupon={
                couponName: couponName,
                couponCode: couponCode,
                discountAmount: discount,
                expiryDate: changeExpiryDate?changeExpiryDate:expiryDate, 
                criteriaAmount: criteriaAmount,
        }
        const updatedCoupon=await Coupon.findByIdAndUpdate(couponId,editedCoupon,{new:true});
        if(updatedCoupon){
            res.redirect('/admin/coupons');
        }else{
            res.render('editCoupon')
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

const deleteCoupon=async (req,res)=>{
    try {
        const couponId=req.query.id;
        console.log('couponId:',couponId);
        const deleted=await Coupon.deleteOne({_id:couponId});
        if(deleted){
            res.json({deleted:true})
        }else{
            res.json({deleted:false})
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

//verifying user entered code
const verifyCoupon=async (req,res)=>{
    try {
        const userId=req.session.userId;
        const userEnteredCode=req.query.cpn;
        console.log('userEnteredCode:',userEnteredCode);
        const orderSubTotal=req.query.total;
        console.log('orderSubTotal:',orderSubTotal);
        const currentDate=new Date();
        console.log('currentDate:',currentDate);

        const couponData=await Coupon.findOne({couponCode:userEnteredCode,expiryDate:{$gte:currentDate}});
        console.log('couponData:',couponData);
        console.log('couponData.criteriaAmount:',couponData.criteriaAmount);
        if(orderSubTotal<couponData.criteriaAmount){
            return res.json({coupon:'criteria didnot reached',couponData});
        }
        console.log('couponData:',couponData);
        
        const useridExist=couponData.usedUser.includes(userId);
        
        if(couponData){
            if(useridExist){
                return res.json({added:'already used'})
            }
            const cartResult = await Cart.findOneAndUpdate(
                { userId: userId },
                { $set: { couponDiscount: couponData._id} },
                { new: true }
              );
              
            console.log('cartResult:',cartResult);

            req.session.couponUsed=couponData;
            console.log('req.sesion in coupon:',req.session);
            console.log('req.session.couponused:',req.session.couponUsed);

            // await Coupon.findOneAndUpdate(
            //     {_id:couponData._id},
            //     {$addToSet:{usedUser:userId}}
            // );
            res.json({verify:true,couponData,cartResult})
        }else{
            res.json({verify:false})
        } 

    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}   
// remove applied coupon by user
const removeCoupon=async (req,res)=>{
    try {
        const userId=req.session.userId;
        const {couponId}=req.body;

       console.log('!!!!!!reached here in remove and couponId:',couponId);

       const updatedCoupon=await Coupon.findByIdAndUpdate({_id:couponId},{$pull:{usedUser:{$in:[userId]}}},{new:true});
       const updatedCart=await Cart.findOneAndUpdate({userId:userId},{$set:{couponDiscount:null}});
       if(updatedCart && updatedCoupon){
            res.status(200).json({updated:true})
       }else{
            res.status(500).json({updated:false})
       }
    
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}
module.exports={
    listCoupons,
    addCoupons,
    saveCoupons,
    editCoupon,
    saveEditCoupon,
    deleteCoupon,
    verifyCoupon,
    removeCoupon
}