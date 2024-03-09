const User=require('../model/userModel');


const isLogin=async (req,res,next)=>{
    try {
        if(req.session.userId){
            next();
        }else{
            res.redirect('/login');
        }
        
    } catch (error) {
        console.log(error.message);
        res.render('Error-500');
    }
}

const isLogout=async (req,res,next)=>{
    try {
        if(req.session.userId){
            res.redirect('/');   
        }else{
             next();
        }
    } catch (error) {
        console.log(error.message);
        res.render('Error-500');
    }
}

const isAdminLogin=async (req,res,next)=>{
    try {
        if(req.session.adminId){
            next();
        }else{
            res.redirect('/admin/')
        }
        
    } catch (error) {
        console.log(error.message);
        res.render('Error-500');
    }
}

const isAdminLogout=async (req,res,next)=>{
    try {
        if(req.session.adminId){
            res.redirect('/admin/home')
        }else{
            next();
        }
        
    } catch (error) {
        console.log(error.message);
        res.render('Error-500');
    }
}

const isUserBlocled=async (req,res,next)=>{
    try{
        const user=req.session.userId
        const blockedUser=await User.findOne({_id:user,isBlocked:true});
        // console.log('blockedUser:',blockedUser);
        if(blockedUser){
            req.session.destroy((err)=>{
                if(err){
                    console.log(err.message);
                }else{
                    console.log('User Session destroyed due to block by admin');
                }
            })
            // req.flash('blocked','you are blocked by admin')
            res.redirect('/');
            
        }else{
            next();
        }

    }catch(error){
        console.log(error.message);
        res.render('Error-500');
    }
}


module.exports={
    isLogin,
    isLogout,
    isAdminLogin,
    isAdminLogout,
    isUserBlocled

}