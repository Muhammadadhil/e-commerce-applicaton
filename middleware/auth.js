
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


module.exports={
    isLogin,
    isLogout,
    isAdminLogin,
    isAdminLogout

}