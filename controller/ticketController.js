const tickets = require("../model/ticketModel");
const users = require("../model/userModel");
const Status = require("../model/status");
const Category = require("../model/category");
const Priority = require('../model/priority');
const notificationController = require('./notificationController');

exports.createTicketController = async (req, res) => {
  console.log("inside createTicketController");

  try {
    const { title, description, category, priority } = req.body;

    // ✅ Validate required fields
    if (!title || !description) {
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
      assignedTeam: categoryDoc.assignedTeam || null, // Auto-assign team from category
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
  console.log("inside viewTicketController");
  try {
    const { status, priority, search, unassigned } = req.query;
    let query = {};

    // If user is not admin, only show their own tickets
    if (req.user.role?.toLowerCase() !== 'admin') {
      query.createdBy = req.user.id;
    }

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedTeam: { $regex: search, $options: 'i' } }
      ];
    }

    if (unassigned === 'true') {
      query.assignedTeam = { $in: [null, ""] };
    }

    // Sorting
    let sortOrder = { createdAt: -1 }; // Default: Newest first
    if (req.query.sort === 'oldest') {
      sortOrder = { createdAt: 1 };
    } else if (req.query.sort === 'priority') {
      sortOrder = { priority: 1 }; // Higher priority first (if IDs are ordered) or just group them
    }

    const allTickets = await tickets.find(query)
      .populate({ path: "createdBy", select: "name" })
      .populate({ path: "assignedTo", select: "name" })
      .populate({ path: "status", select: "name color" })
      .populate({ path: "priority", select: "name color" })
      .populate({ path: "category", select: "name" })
      .sort(sortOrder);

    res.status(200).json(allTickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
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
      { path: "category", select: "name" },           // <-- populate category
      { path: "comments.commentedBy", select: "name role" } // <-- populate comment authors
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

// Update ticket (Admin or Assigned Agent)
exports.updateTicketController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, assignedTeam, comment } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (assignedTeam !== undefined) updateData.assignedTeam = assignedTeam || null;

    const ticket = await tickets.findById(id).populate('status');
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Permission Check
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    const isAssignedAgent = ticket.assignedTo?.toString() === req.user.id;
    const isCreator = ticket.createdBy?.toString() === req.user.id;

    // Status Logic for User Closure
    const isActuallyResolved = ticket.status?.name?.toLowerCase() === 'resolved';

    // Find "Closed" status if the user is trying to close it
    let isClosing = false;
    if (status) {
      const StatusModel = require('../model/status');
      const targetStatus = await StatusModel.findById(status);
      if (targetStatus?.name?.toLowerCase() === 'closed') {
        isClosing = true;
      }
    }

    if (!isAdmin && !isAssignedAgent) {
      // If user is creator, they can ONLY change status to "Closed" IF it's "Resolved"
      if (isCreator && isClosing && isActuallyResolved) {
        // Allowed
      } else {
        return res.status(403).json({ message: "You don't have permission to update this ticket" });
      }
    }

    // Add activity log
    if (status && status.toString() !== ticket.status?.toString()) {
      ticket.activityLog.push({ message: `Status updated`, timestamp: new Date() });
    }
    if (assignedTeam !== undefined && assignedTeam !== ticket.assignedTeam) {
      ticket.activityLog.push({ message: `Assigned to team: ${assignedTeam || 'Unassigned'}`, timestamp: new Date() });
    }

    if (comment) {
      ticket.comments.push({
        commentedBy: req.user.id,
        message: comment,
        createdAt: new Date()
      });
    }

    Object.assign(ticket, updateData);
    await ticket.save();

    // Trigger Notifications
    if (assignedTo && assignedTo.toString() !== (ticket.assignedTo?._id?.toString() || ticket.assignedTo?.toString())) {
      await notificationController.createNotification({
        recipient: assignedTo,
        sender: req.user.id,
        message: `You have been assigned to ticket: ${ticket.title}`,
        ticketId: ticket._id,
        type: "assigned"
      });
    }

    if (comment) {
      // Notify creator if admin/agent commented. If user commented, notify agent (or admin if unassigned).
      let recipient = null;
      if (isAdmin || isAssignedAgent) {
        recipient = ticket.createdBy?._id || ticket.createdBy;
      } else {
        recipient = (ticket.assignedTo?._id || ticket.assignedTo);
      }
      await notificationController.createNotification({
        recipient,
        sender: req.user.id,
        message: `New comment on ticket: ${ticket.title}`,
        ticketId: ticket._id,
        type: "commented"
      });
    }

    if (isClosing && isCreator) {
      // Notify assigned agent or admin that ticket is closed
      const recipient = ticket.assignedTo?._id || ticket.assignedTo;
      if (recipient) {
        await notificationController.createNotification({
          recipient,
          sender: req.user.id,
          message: `Ticket closed by user: ${ticket.title}`,
          ticketId: ticket._id,
          type: "closure"
        });
      }
    }

    const updatedTicket = await tickets.findById(id).populate([
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
      { path: "status", select: "name color" },
      { path: "priority", select: "name color" },
      { path: "category", select: "name" },
      { path: "comments.commentedBy", select: "name role" }
    ]);

    res.status(200).json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
