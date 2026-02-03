const express = require("express");
const usercontroller = require("../controller/usercontroller");
const {validate}= require('../middleware/validate')
const {createUserValidator,loginValidator} = require('../validators/user.validator')

const router=new express.Router()
//register user
router.post("/auth/register",validate(createUserValidator),usercontroller.registerController)
//login
router.post("/auth/login",validate(loginValidator),usercontroller.loginController)

module.exports=router