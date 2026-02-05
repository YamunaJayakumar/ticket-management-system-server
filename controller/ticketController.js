const tickets = require("../model/ticketModel");
const users = require("../model/userModel");
const Status = require("../model/status");
const Category = require("../model/category");
const Priority = require('../model/priority'); 

exports.createTicketController = async (req, res) => {
  console.log("inside createTicketController");

  try {
    const { title, description, category, priority } = req.body;

    // ✅ Validate required fields
    if (!title || !description ) {
      return res.status(400).json({
        message: "Title, description and category are required",
      });
    }

    // ✅ Find Category by ID
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    // ✅ Find Priority by ID (or default to "Medium")
    let priorityDoc;
    if (priority) {
      priorityDoc = await Priority.findById(priority);
      if (!priorityDoc) {
        return res.status(400).json({ message: "Invalid priority id" });
      }
    } else {
      priorityDoc = await Priority.findOne({ name: "Medium" });
      if (!priorityDoc) {
        return res.status(500).json({ message: "Default priority not found" });
      }
    }

    // ✅ Find default status ("Open")
    const openStatus = await Status.findOne({ name: "Open" });
    if (!openStatus) {
      return res.status(500).json({ message: "Default status 'Open' not found" });
    }

    // ✅ Create ticket
    const ticket = new tickets({
      title,
      description,
      category: categoryDoc._id,
      priority: priorityDoc._id,
      status: openStatus._id,
      createdBy: req.user.id,
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};






//view all tickets-user(user can see ticket created by him) and admin(admin can see all tickets)


exports.viewTicketController = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let ticketsList;

    if (role === "admin") {
      ticketsList = await tickets
        .find()
        .populate({ path: "createdBy", select: "name email" })
        .populate({ path: "assignedTo", select: "name email" })
        .populate({ path: "status", select: "name color" })      // <-- populate status
        .populate({ path: "priority", select: "name color" })    // <-- populate priority
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 });
    } else {
      ticketsList = await tickets
        .find({ $or: [{ createdBy: userId }, { assignedTo: userId }] })
        .populate({ path: "createdBy", select: "name email" })
        .populate({ path: "assignedTo", select: "name email" })
        .populate({ path: "status", select: "name color" })      // <-- populate status
        .populate({ path: "priority", select: "name color" })    // <-- populate priority
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(ticketsList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};




// View one ticket with populated fields
exports.getTicketDetailsController = async (req, res) => {
  console.log("inside getTicketDetailsController");

  try {
    const { id } = req.params;
    console.log("Ticket ID:", id);

    // Find ticket and populate all references
    const ticket = await tickets.findById(id).populate([
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
      { path: "status", select: "name color" },       // <-- populate status
      { path: "priority", select: "name color" },     // <-- populate priority
      { path: "category", select: "name" }           // <-- populate category
    ]);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json(ticket);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

