const {Schema, model} =require('mongoose')


const userSchema = new Schema({
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
    occupation:{
        type:String,
    },
    phone:{
        type:String,
    },
    address:{
        type:String,
    },
    city:{
        type:String,
    },
    busstop:{
        type:String,
    },
    state:{
        type:String,
    },
    nationality:{
        type:String,
    },
    stateoforigin:{
        type:String,
    },
    nextofkinname:{
        type:String,
    },
    nextofkinphone:{
        type:String,
    },
    profile:{
        type:String,
    },
    uptodate:{
        type:Boolean,
        default:false
    },
    bankname:{
        type:String
    },
    accountname:{
        type:String
    },
    accountnumber:{
        type:String
    },
    transfers:[
        {
            type:Object
        }
    ],
    withdrawalRequestList:[
        {
            type:Object
        }
    ],
    withdrawalRequestHistory:[
        {
            type:Object
        }
    ],
    terminateRequestList:[
        {
            type:Object
        }
    ],
    paymentRequest:{
        type:Boolean
    },
    withdrawalRequest:{
        type:Boolean
    },
    terminateRequest:{
        type:Boolean
    },
    history:[
        {
            type:Object
        }
    ],
    approvedUser:{
        type:Boolean,
        default:false
    },
    startedSaving:{
        type:Boolean,
        default:false
    }
})




module.exports=model('User',userSchema)
