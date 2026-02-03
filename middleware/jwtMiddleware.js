const jwt =require("jsonwebtoken")

const jwtMiddleware =(req,res,next)=>{
    console.log("inside jwtmiddleware")

    const authHeader =req.headers.authorization
     if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"Token missing"})
     }
     const token=authHeader.split(" ")[1]
     try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user={
            id:decoded.userId,
            role:decoded.role
        }
        next()

     }catch(err){
        return res.status(500).json(err)
     }

}