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
        enum:['admin','user'],
        default:'user'
    },
},{
    timestamps:true
});

const users =mongoose.model("users",userSchema)

module.exports=users