const { z } = require("zod");

//register user
const createUserValidator=z.object({
    name: z.string().min(2),
    email:z.string().email({ message: "Invalid email address" }),
    password:z.string().min(3)
})
//login user

const loginValidator=z.object({
    email:z.string().email({message:"invalid email address"}),
    password:z.string().min(1,"password is required")
})

module.exports ={createUserValidator,loginValidator}