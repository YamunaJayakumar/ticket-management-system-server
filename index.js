const express =require("express")
require('dotenv').config()
const cors =require("cors")
require("./config/db")
const ticket_server =new express()
const router=require("./routes/routing")
ticket_server.use(cors())
ticket_server.use(express.json())
ticket_server.use(router)
const PORT=3000
ticket_server.listen(PORT,()=>{
    console.log(`Ticket server is running on port ${PORT}`);
})
ticket_server.get("/",(req,res)=>{
    res.send("Ticket server is running")
})