const express=require("express")
const router=new express.Router()
const usercontroller=require("../controller/usercontroller")

//register user
router.post("/register",usercontroller.registerController)
//login user
router.post("/login",usercontroller.loginController)

module.exports=router