const tickets = require("../model/ticketModel")
const users = require("../model/userModel"); // to check assignedTo user exists

// Create Ticket Controller
exports.createTicketController = async (req, res) => {
    console.log("inside createTicketController");

    try {
        // Get user info from token
        const userId = req.user.id;
        const role = req.user.role;

        // Destructure request body
        const { title, description, priority, category, assignedTo } = req.body;

        // Basic validation
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        // Validate priority enum
        const validPriorities = ["Low", "Medium", "High", "Critical"];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid priority value" });
        }

        // Only admin can assign tickets
        let assignedUser = null;
        if (assignedTo) {
            if (role !== "Admin") {
                return res.status(403).json({ message: "Only admin can assign tickets" });
            }

            // Check if assigned user exists
            assignedUser = await users.findById(assignedTo);
            if (!assignedUser) {
                return res.status(404).json({ message: "Assigned user not found" });
            }
        }

        // Create ticket object
        const newTicket = new tickets({
            title,
            description,
            priority: priority || "Low", // default Low
            category: category || "Others", // default Others
            status: "Open",
            createdBy: userId,
            assignedTo: assignedUser ? assignedUser._id : null,
            activityLog: [
                {
                    message: "Ticket created",
                    timestamp: new Date()
                },
                assignedUser
                    ? { message: `Assigned to ${assignedUser.name}`, timestamp: new Date() }
                    : null
            ].filter(Boolean) // remove null if no assigned user
        });

        // Save ticket
        const savedTicket = await newTicket.save();

        // Populate for frontend (createdBy and assignedTo)
        await savedTicket.populate([
            { path: "createdBy", select: "name email" },
            { path: "assignedTo", select: "name email" }
        ]);

        // Return consistent API response
        return res.status(201).json({
            success: true,
            data: savedTicket
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
};


//view all tickets
exports.viewTicketController = async (req, res) => {
    console.log("inside viewTicketController")
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        
        let ticketsList;
        if (role == "admin") {
            // Admin can see all tickets
            ticketsList = await tickets.find().populate(
                [
                    { path: "createdBy", select: "name email" },
                    { path: "assignedTo", select: "name email" }

                ]
            ).sort({ createdAt: -1 }) // newest first
            
        } else {
            //users can see tickets they created or assigned to them
            ticketsList = await tickets.find({
                $or: [
                    { createdBy: userId },
                    { assignedTo: userId }
                ]
            }).populate([
          { path: "createdBy", select: "name email" },
          { path: "assignedTo", select: "name email" }
        ])
        .sort({ createdAt: -1 });
        }
        return res.status(200).json(ticketsList);
    } catch (err) {
        res.status(500).json(err)
    }

}

//view one ticket
exports.getTicketDetailsController=async(req,res)=>{
    console.log("inside getTicketDetailsController");
    try{
        const { id } = req.params
        console.log(id)
        // Find ticket and populate createdBy, assignedTo
        const ticket =await tickets.findById(id).populate([
            { path: "createdBy", select: "name email" },
            { path: "assignedTo", select: "name email" }
        ])
        if(!ticket){
            return res.status(404).json("Ticket not found")
        }
    return res.status(200).json(ticket)


    
    }catch(err){
        res.status(500).json(err)
    }
    
}
