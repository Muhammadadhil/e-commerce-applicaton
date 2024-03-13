const Joi=require('joi')
const { schema } = require('../model/userModel')

// const registerationSchema=Joi.object({
//     firstName:Joi.string().required(),
//     lastName: Joi.string().required(),
//     email:Joi.string().email().required(),
//     mobile:Joi.string().required(),
//     password:Joi.string().min(6).required(),
//     confirmPassword:Joi.string().valid(Joi.ref('password')).required().messages({
//         'any.only': 'Password and Confirm Password must match',
//     })
// });


// const AddressSchema=Joi.object({
//     name: Joi.string().required(),
//     landmark: Joi.string().required(),
//     city: Joi.string().required(),
//     phone: Joi.number().required(),
//     address: Joi.string().required(),
//     state: Joi.string().required(),
//     pincode: Joi.number().required(),
//     email: Joi.string().email().required(),
// })
const AddressSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required.',
        'string.empty': 'Name cannot be empty.'
    }),
    landmark: Joi.string().required().messages({
        'any.required': 'Landmark is required.',
        'string.empty': 'Landmark cannot be empty.'
    }),
    city: Joi.string().required().messages({
        'any.required': 'City is required.',
        'string.empty': 'City cannot be empty.'
    }),
    phone: Joi.number().required().messages({
        'any.required': 'Phone number is required.',
        'number.base': 'Phone must be a number.'
    }),
    address: Joi.string().required().messages({
        'any.required': 'Address is required.',
        'string.empty': 'Address cannot be empty.'
    }),
    state: Joi.string().required().messages({
        'any.required': 'State is required.',
        'string.empty': 'State cannot be empty.'
    }),
    pincode: Joi.number().required().messages({
        'any.required': 'Pincode is required.',
        'number.base': 'Pincode must be a number.'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Please provide a valid email address.'
    }),
});


const validateAddress=(req,res,next)=>{
    const {error}=AddressSchema.validate(req.body);

    if(error){
        console.log('joi: errror detailss:',error.details);
        return res.status(400).json({validate:false,message:error.details});
    }
    console.log('no scenes');

    next();
}

module.exports={
    validateAddress
}