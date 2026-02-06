const users = require("../model/userModel")
const bcrypt = require('bcrypt')
//add agent
exports.addAgentController = async (req, res) => {
    console.log("inside addAgentController")
    try {
        const { name, email, password,skills = [], isActive = true } = req.body

        //check required fields
        if (!name || !email || !password) {
            return res.status(400).json("All fields are required")
        }
        //check email si unique
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            return res.status(409).json("agent already exists")
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        //create agent
        const agent = new users({
            name,
            email,
            password: hashedPassword,
            role: 'agent',
            skills,
            isActive
        })
        await agent.save()
        res.status(200).json({
            _id: agent._id,
            name: agent.name,
            email: agent.email,
            role: agent.role,
            skills:agent.skills,
            isActive:agent.isActive

        })

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

}
//get agent list
exports.getAgentController =async(req,res)=>{
    console.log("inside getAgentController")
    try{
        const agents = await users.find({role:"agent"}).select('-password')
        return res.status(200).json(agents)

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }

}
//edit agent details
exports.updateAgentController=async(req,res)=>{
    console.log("Inside updateAgentController")
    const {id}=req.params
    const {name,email}=req.body
    try{
        const agent  =await users.findOneAndUpdate(
            {
                _id:id,role:"agent"
            },
            {name,email},{new:true}
        ).select('-passowrd')

        if (!agent) return res.status(404).json("Agent not found")

        res.status(200).json(agent)


    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}
//remove agent
exports.removeAgentController =async(req,res)=>{
    console.log("inside reomveAgentController")
    try{
        const {id}=req.params
        //  // Optional: check if agent has assigned tickets
        // const assignedTickets = await Ticket.find({ assignedTo: id })
        // if (assignedTickets.length > 0) {
        //     return res.status(400).json("Cannot delete agent with assigned tickets")
        // }
        const agent = await users.findOneAndDelete({ _id: id, role: "agent" })
        if (!agent) return res.status(404).json("Agent not found")
        res.status(200).json("agent removed successfully")

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}