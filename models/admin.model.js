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
    address:{
        type:String,
        required:true,
        trim:true
    },
    username:{
        type:String,
        required:true,
        trim:true
    },
    role:{
        type:String,
        defualt:'manager'
    }
})


module.exports=model("admin",adminSchema)