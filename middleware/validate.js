const joi=require('joi')

const registerationSchema=joi.object({
    firstName:joi.string().required(),
    lastName: joi.string().required(),
    email:joi.string().email().required(),
    mobile:joi.string().required(),
    password:joi.string().min(6).required(),
    confirmPassword:joi.string().valid(joi.ref('password')).required().messages({
        'any.only': 'Password and Confirm Password must match',
    })


});

module.exports={
    registerationSchema
}