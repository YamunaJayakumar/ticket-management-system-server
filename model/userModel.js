const mongoose=require("mongoose")

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
       
    },
    role:{
        type:String,
        enum:['admin','user',"agent"],
        default:'user'
    },
    //agent only fields
    skills:{
        type:[String],
        default:[]
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
});

const users =mongoose.model("users",userSchema)

module.exports=users