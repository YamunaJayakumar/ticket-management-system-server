const users=require("../model/userModel")
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
            const newUser= await users.create({name,email,password})
            res.status(200).json(newUser)     
              }

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }


}
//login existing user
exports.loginController=async(req,res)=>{
    console.log("inside loginController")
    const{email,password}=req.body
    try{
        const existingUser=await users.findOne({email})
        // check mail in model
        if(!existingUser){
            res.status(404).json({message:"User not found, please register"})
        }else{
            if(existingUser.password!==password){
                res.status(401).json({message:"Invalid credentials..password is not correct"})
            }else{
                //token generation
                const token=jwt.sign({userId:existingUser._id,userEmail:existingUser.email,username:existingUser.email,role:existingUser.role},process.env.JWT_SECRET)
                res.status(200).json({message:"Login successful",user:existingUser,token})
            }  
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)   
    }
}