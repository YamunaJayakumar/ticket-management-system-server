const tickets= require("../model/ticketModel")
//create ticket
exports.createTicketController=async(req,res)=>{
    console.log("inside createTicketController");
    //user info from token
    const userId = req.user.id
    const role = req.user.role

    //validate body
    const {title,description,priority,category,assignedTo}=req.body
    if(assignedTo && role !== "admin"){
        return res.status(403).json("only admin can assign tickets")
    }
    //create ticket object
    const newTicket =new tickets({
        title,
        description,
        priority,
        category,
        status:"open",
        createdBy:userId,
        assignedTo:assignedTo || null,
        activityLog:[
            {
                message:"Ticket created"
            }
        ]
    })
    await newTicket.save()
    return res.status(200).json(newTicket)

    

}
//view all tickets
//view one ticket
//update ticket
//add comments