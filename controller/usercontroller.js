const users=require("../model/userModel")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")
// Create a new user
exports.registerController=async(req,res)=>{
    console.log("inside registerController")
    const {name,email,password}=req.body
    try{
        const existingUser=await users.findOne({email})
        if(existingUser){
            res.status(409).json({message:"User already exists"})
            
        }else{
            const hashedPassword=await bcrypt.hash(password,10)
            const newUser= await users.create({name,email,password:hashedPassword})
            res.status(200).json(newUser)     
              }

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }


}
//login
exports.loginController=async(req,res)=>{
    console.log("inisde loginController");
    const{email,password}=req.body
    try{
        //1.check if user present
        const existingUser=await users.findOne({email})
        console.log(existingUser);
        
        if(existingUser){
            // 2. Compare passwords
            const isMatch= await bcrypt.compare(password,existingUser.password)
            if(!isMatch){
                return res.status(400).json({message:"1invalid email or password"})

            }
            const token=jwt.sign({
                id:existingUser._id,email:existingUser.email,role:existingUser.role
            },process.env.JWT_SECRET)
            res.status(200).json({existingUser,token})

        }else{
            res.status(400).json({ message: "2Invalid email or password" })
        }

    }catch(error){
        res.status(500).json(error)
    }
    
}

