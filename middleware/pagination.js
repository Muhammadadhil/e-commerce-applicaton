const Users=require('../model/userModel');

function paginatedResult(){
    
    return async (req,res,next)=>{

        let page=1;
        if(req.query.page){
            page=Number(req.query.page);
        }
        
        let result={};
        let limit=5;

        const count=await Users.find().countDocuments();
        result.pagesCount=Math.ceil(count/limit);
        
        result.nextPage=1;
        if(page*limit<count){
            result.nextPage=page+1;
        }
    
        result.previousPage=1;
        if(page>1){
            result.previousPage=page-1;
        }

        try {
            result.users=await Users.find().limit(limit*1).skip((page-1)*limit).exec();
            console.log('result:',result);
            res.paginatedResult=result; //send the result object as response
            next();

        } catch (error) {
            res.status(500).send(error.message);
            console.log('error:',error.message);
        }

    }
    
}

module.exports=paginatedResult;
    