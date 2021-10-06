const {Schema, model} =require('mongoose')


const managersSchemam= new Schema({
    name:{
        type:String
    },
    location:{
        type:String
    }
})

module.exports=model('manager',managersSchemam)