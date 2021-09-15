const {Schema, model} =require('mongoose')


const adminSchema = new Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
})


module.exports=model("admin",adminSchema)