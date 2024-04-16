const User=require('../model/userModel');
const Category=require('../model/categoryModel');
const bcrypt=require('bcrypt');
const Order=require('../model/orderModel');
const Products=require('../model/productsModel');
const Coupon=require('../model/couponModel');



//load admin login page
const loginLoad=async (req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500')
    }
}
//login post
const verifyAdmin=async (req,res)=>{
    try {
        const {email,password}=req.body;
        console.log(`email:${email} & password:${password}`);
        const adminData=await User.findOne({email:email});

        if(adminData){
            const matchPassword=await bcrypt.compare(password,adminData.password);
            console.log('matchpassword',matchPassword);
            
            if(matchPassword){
                if(adminData.isAdmin){
                    req.session.adminId=adminData._id;
                    res.json({admin:true,message:'Welcome Administrator'})

                }else{
                    res.json({admin:false,message:'email or password in incorrect'})
                }
            }else{
                return res.json({admin:false,message:'Incorrect Password'});
            }
        }else{
            res.json({admin:false,message:'Your email or password is incorrect'});
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}
//load the dashboard
const loadDashBoard=async (req,res)=>{
    try {

        const OrdersCount=await Order.find({}).count();
        const productsCount=await Products.find({}).count();
        const CategoryCount=await Category.find({}).count();

        const overallData=await Order.aggregate([
            {
                $group:{
                    _id:"",
                    totalSalesCount:{$sum:1},
                    totalRevenue:{$sum:'$subTotal'}
                }
                
            }
        ])
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; 

        //monthly data section
        const monthlyData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(currentDate.getFullYear(), currentMonth - 1, 1), 
                        $lt: new Date(currentDate.getFullYear(), currentMonth, 1) 
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$orderDate' },
                    totalSalesCount: { $sum: 1 },
                    totalRevenue: { $sum: '$subTotal' }
                }
            }
        ]);
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthId=monthlyData[0]._id;
        const monthName=monthNames[monthId-1];

        //best selling product
        const bestSoldProducts = await Order.aggregate([
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$products.productId',
                    count: { $sum: '$products.quantity' },
                    name: { $first: '$productDetails.name' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        // const bestSoldProducts=await Promise.all(bestSellingProducts.map(async (product)=>{
        //     const count=product.count;
        //     const productDetails=await Products.findOne({_id:product._id});
        //     return {count,productDetails};
        // }))

        //best selling Category
        const bestSoldCategory=await Order.aggregate([
            {$unwind:'$products'},
            {$lookup:
                {
                    from:'products',
                    localField:'products.productId',
                    foreignField:'_id',
                    as:'productDetails'
                }
            },
            {$unwind:'$productDetails'},
            {$lookup:
                {
                    from:'categories',
                    localField:'productDetails.categoryId',
                    foreignField:'_id',
                    as:'categoryDetails'
                }
            },
            {$unwind:'$categoryDetails'},
            {$group:{_id:'$categoryDetails.name',count:{$sum:1}}},
            {$sort:{count:-1}},
            {$limit:5}
        ])

        res.render('adminDashboard', {
            OrdersCount,
            productsCount,
            CategoryCount,
            overallData,
            monthlyData,
            monthName,
            bestSoldProducts,
            bestSoldCategory
        });        

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}
//load the users page
const loadCustomers=async (req,res)=>{
    try {
        const customers=await User.find({})
        // console.log('users:',customers);
        res.render('customers',{users:customers})
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 

    }
}

//block and unblock the users
const userBlock=async (req,res)=>{
    try {

        const user_id=req.body.user_id;
        const userData=await User.findOne({_id:user_id});
        if(!userData.isBlocked){
            await User.findByIdAndUpdate({_id:user_id},{$set:{isBlocked:true}})
        }else{
            await User.findByIdAndUpdate({_id:user_id},{$set:{isBlocked:false}})
        }
        res.json({res:true})

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}
//load the category page
const loadCategory=async (req,res)=>{
    try {
        const categories=await Category.find({});
        res.render('category',{categories});
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}
//add category
const addCategory=async (req,res)=>{
    try {
        const {name,description}=req.body;
        const existingName= await Category.findOne({name:{$regex:new RegExp(name,'i')}});

        if(existingName){
            return res.json({added:false,message:'category already exist'})
        }
        
        const newCategory=new Category({
            name:name,
            description:description,
            isBlocked:false
        })  

        const savedCategory=newCategory.save();

        if(savedCategory){
            res.json({added:true,message:'Category added successfully'})
        }else{
            res.json({added:false,message:'Category not added'})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}
//edit category
const editCategory=async (req,res)=>{
    try {
        const categoryId=req.query.id;
        console.log("category id:",categoryId);
        const categoryData=await Category.findById({_id:categoryId});
        console.log('category with the id:',categoryData);
        res.render('editCategory',{categoryData});

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}
//edit category post
const updateCategory=async (req,res)=>{
    try {
        console.log('reached update category');
        const {name,description,categoryId}=req.body;
        const currentCategory= await Category.findOne({_id:categoryId});

        if(!currentCategory){
            return res.json({update:false,message:"category not found"});
        }

        console.log('name ,currentCategory.name:',name,currentCategory.name);
        if(name !== currentCategory.name){
            console.log('reached here');
            const existingName=await Category.findOne({name:name})
            console.log('existingname:',existingName);
            if(existingName){
                return res.json({update:false,message:'Category name already exist'})
            }
        }
        const updatedCategory=await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:name,description:description}});

        if(updatedCategory){
            res.json({update:true,message:'updated successfully'});
            console.log('data updated');
        }else{
            res.json({update:false,message:'there is a problem while updating your data'});
        }
        // console.log("id:",req.query.id);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

//block the category
const blockCategory=async (req,res)=>{
    try {
        const {categoryId}=req.body;
        const categoryData=await Category.findOne({_id:categoryId})
        categoryData.isBlocked=!categoryData.isBlocked ;
        await categoryData.save();
        
        const isBlocked=categoryData.isBlocked;6
        
        const productsData=await Products.updateMany({categoryId:categoryId},{$set:{isCategoryBlocked:isBlocked}})
        console.log('productsData:',productsData);
    
        res.json({updated:true});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}

const adminLogout=async (req,res)=>{
    try {
        delete req.session.adminId;
        res.redirect('/admin/');
        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500'); 
    }
}
//list order 
const loadOrderList=async (req,res)=>{
    try {
        const dateOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };
        const orders=await Order.find({}).sort({orderDate:-1}); 
        res.render('order',{orders,dateOptions});

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

//order details
const loadOrderDetails=async (req,res)=>{
    try {
        const orderId=req.query.id;
        console.log('orderId:',orderId);   

        let populateOption={
            path:'products.productId',
            model:'products'
        }
        
        const orderData=await Order.findOne({_id:orderId}).populate(populateOption);
        const address=await Order.findOne({_id:orderId},{deliveryAddress:1,_id:0}); 
        
        console.log('orderData:',orderData,"address:",address);

        res.render('orderDetails',{address,orderData});

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

const changeOrderStatus=async (req,res)=>{
    try {
        console.log("reached here in update status");
        const {orderId,productId,status}=req.body;
    
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, 'products.productId': productId },
            { $set: { 'products.$.productStatus': status } },
            { new: true }
        );
        if(updatedOrder.products.every(product => product.productStatus === 'delivered')){
            await Order.findOneAndUpdate(
                {_id:orderId},
                {$set:{orderStatus:'delivered'}},
                {new:true}
            );
        }
        console.log('updatedOrder:',updatedOrder);

        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

//load sales report page
const loadSalesReport=async(req,res)=>{
    try {
        const filterCriteria=req.query.filter;
        const dateOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };
        console.log('filterCriteria:',filterCriteria);

        let orders=[];
        let dateOrTime='';
        // orders=await Order.find({}).populate('userId').sort({orderDate:-1});
        const overallData=await Order.aggregate([
            {$match:{orderStatus:{$ne:"pending"}}},
            { 
                $group:{
                    _id:'',
                    totalSalesCount:{$sum:1},
                    totalRevenue:{$sum:'$subTotal'},
                }
            }
        ])

        switch(filterCriteria){
            
            case 'daily':
            orders=await dialyReport();
            dateOrTime='day';
            break;

            case 'weekly':
                orders=[]
                orders= await generateReport('$week');
                dateOrTime='week'
                break;

            case 'monthly':
                orders=[] 
                orders= await generateReport('$month');
                dateOrTime='month'
                break;    

            case 'yearly':
                orders=[] 
                orders= await generateReport('$year');  
                dateOrTime='year'  
                break;
        }

        const startDate=req.query.start;
        const endDate=req.query.end;
        
        if(startDate && endDate){
            orders=await customReport(startDate,endDate);
        }

        res.render('salesReport',{orders,dateOptions,filterCriteria,overallData,dateOrTime})

    } catch (error) {
        console.log(error.message);
        res.status(500).render('error-500') 
    }
}

const generateReport=async (timeUnit)=>{
    try {
        const orderDatas=await Order.aggregate([
            {$match:{orderStatus:{$ne:"pending"}}},
            { 
                $group: {
                    _id: { [timeUnit]: "$orderDate" },
                    totalSalesCount: { $sum: 1},
                    totalRevenue:{$sum:'$subTotal'},
                }
            }
        ]);
        return orderDatas;

    } catch (error) {
        console.log(error.message);
    }
}

const dialyReport=async ()=>{

    const orderDatas=await Order.aggregate([
        {$match:{orderStatus:{$ne:"pending"}}},
        {
            $group: {
                _id: { $dateToString: { format: "%d-%m-%Y", date: "$orderDate" } },
                totalSalesCount: { $sum: 1},
                totalRevenue:{$sum:'$subTotal'},
            }
        },{$sort:{_id:-1}}
    ]);
    return orderDatas;
}

const customReport=async (start,end)=>{
    try {
        console.log(start,end);
        console.log(new Date(start));
        const orderDatas=await Order.aggregate([
            {
                $match:{
                    orderDate:{ $gte:new Date(start),$lte:new Date(end)}
                }
            },
            {
                $group: {
                    _id: '$orderDate',
                    totalSalesCount: { $sum: 1},
                    totalRevenue:{$sum:'$subTotal'},
                }
            }
        ]);
        return orderDatas;

    } catch (error) {
        console.log(error.message);
    }
}


const chartData=async (req,res)=>{
    try {
    
        const {chartType}=req.body;
        console.log('chartType:',chartType);

        let barData;
        
        if(chartType=='monthly'){
            await monthlyData();
        }else{
            await yearlyData();
        }

    
         async function monthlyData(){
            
            const salesData=await Order.aggregate([
                {$match:{orderStatus:{$ne:"pending"}}},
                {
                    $group:{
                        _id:{$month:"$orderDate"},
                        monthlySalesCount: { $sum: 1},
                        monthlyRevenue:{$sum:'$subTotal'},
                    }
                }    
            ]);

            // console.log('salesData:',salesData);
            barData=new Array(12).fill(0);
            
            salesData.forEach((item)=>{
                const monthIndex=item._id-1;
                barData[monthIndex]=item.monthlyRevenue;
            })
         }

         async function yearlyData(){
            
            const salesData=await Order.aggregate([
                {$match:{orderStatus:{$ne:"pending"}}},
                {
                    $group:{
                        _id:{$year:"$orderDate"},
                        yearlySalesCount: { $sum: 1},
                        yearlyRevenue:{$sum:'$subTotal'},
                    }
                }    
            ]);
            
            barData=new Array(10).fill(0);
            salesData.forEach((item)=>{
                const yearIndex=item._id-2018
                console.log('yearIndex:',yearIndex);
                barData[yearIndex]=item.yearlyRevenue;
            })
        }
        
        res.json({barData})

        
    } catch (error) {
        console.log(error.message);
        res.status(500).render('Error-500');
    }
}


module.exports={
    loginLoad,
    verifyAdmin,
    loadDashBoard,
    loadCustomers,
    userBlock,
    loadCategory,
    addCategory,
    editCategory,
    updateCategory,
    blockCategory,
    adminLogout,
    loadOrderList,
    loadOrderDetails,
    changeOrderStatus,
    loadSalesReport,
    chartData
}
