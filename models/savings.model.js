const {Schema, model} =require('mongoose')


const savingsSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    savings:[
        {
            name:{
                type:"string",
        
            },
            amount:{
                type:Number
            },
            purpose:{
                type:String
            },
            balance:{
                type:Number,
                default:0
            }
        }
    ]
})
    module.exports=model('savings',savingsSchema)