const tickets = require('../model/ticketModel')
const Priorities = require('../model/priority')
const statuses = require('../model/status')
const Teams = require('../model/team')
const notificationController = require('./notificationController')

//get:ticket assigned to a logged in agent
exports.getMyTicket = async (req, res) => {
    console.log("inside getMyTicket")
    try {
        const agentId = req.user.id

        // Get teams the agent belongs to
        const agentTeams = await Teams.find({ members: agentId }, '_id');
        const agentTeamIds = agentTeams.map(t => t._id);

        const ticket = await tickets.find({
            $or: [
                { assignedTo: agentId },
                { assignedTeam: { $in: agentTeamIds } }
            ]
        }).populate("priority", "name")
            .populate("status", "name")
            .populate("category", "name")
            .populate("assignedTeam", "name")
            .populate("createdBy", "name email")
            .sort({ updatedAt: -1 });

        return res.status(200).json(ticket)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}
//get: single ticket details
exports.getSingleTicketDetails = async (req, res) => {
    console.log("inside getSingleTicketDetails")
    try {
        const { id } = req.params

        const ticket = await tickets.findById(id).populate("priority", "name")
            .populate("status", "name")
            .populate("category", "name")
            .populate("assignedTeam", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .populate("comments.commentedBy", "name role");

        if (!ticket) {
            return res.status(404).json("ticket not found")
        }


        return res.status(200).json(ticket)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}
//patch:update ticket status
exports.updateTicketStatus = async (req, res) => {
    console.log("inside updateTicketStatus")
    const { id } = req.params;
    const { statusId } = req.body;
    try {
        const ticketCheck = await tickets.findById(id).populate('status');
        if (!ticketCheck) return res.status(404).json("ticket not found");
        if (ticketCheck.status?.name?.toLowerCase() === 'closed') {
            return res.status(403).json({ message: "Cannot update status of a closed ticket" });
        }

        const ticket = await tickets.findByIdAndUpdate(id,
            {
                status: statusId,
                $push: {
                    activityLog: {
                        message: `Status updated by agent`

                    },
                },
            }, { new: true }
        ).populate("priority", "name")
            .populate("status", "name")
            .populate("category", "name")
            .populate("assignedTeam", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .populate("comments.commentedBy", "name role");

        if (!ticket) {
            return res.status(404).json("ticket not found")
        }


        return res.status(200).json(ticket)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}
//post"add comment (agent)
exports.addComment = async (req, res) => {
    console.log("inside addComment")
    const { id } = req.params;
    const { message } = req.body; // Fixed missing message destructuring
    try {
        const ticketCheck = await tickets.findById(id).populate('status');
        if (!ticketCheck) return res.status(404).json({ message: "Ticket not found" });
        if (ticketCheck.status?.name?.toLowerCase() === 'closed') {
            return res.status(403).json({ message: "Cannot add comments to a closed ticket" });
        }

        const ticket = await tickets.findByIdAndUpdate(
            id,
            {
                $push: {
                    comments: {
                        commentedBy: req.user.id,
                        message
                    },
                },
            },
            { new: true }
        ).populate("comments.commentedBy", "name role");

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Trigger Notification to creator
        const ticketDoc = await tickets.findById(id);
        await notificationController.createNotification({
            recipient: ticketDoc.createdBy,
            sender: req.user.id,
            message: `Agent commented on your ticket: ${ticketDoc.title}`,
            ticketId: ticketDoc._id,
            type: "commented"
        });

        return res.status(200).json(ticket)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}
// Get agent dashboard metrics
exports.getAgentDashboardMetrics = async (req, res) => {
    try {
        const agentId = new (require('mongoose').Types.ObjectId)(req.user.id);

        // Get teams the agent belongs to
        const agentTeams = await Teams.find({ members: agentId }, '_id');
        const agentTeamIds = agentTeams.map(t => t._id);

        const visibilityMatch = {
            $or: [
                { assignedTo: agentId },
                { assignedTeam: { $in: agentTeamIds } }
            ]
        };

        // 1. Total Assigned Tickets
        const totalTickets = await tickets.countDocuments(visibilityMatch);

        // 2. High Priority Tickets (High or Critical)
        const highPriorityList = await Priorities.find({ name: { $in: ["High", "Critical"] } }, '_id');
        const highPriorityIds = highPriorityList.map(p => p._id);
        const highPriority = await tickets.countDocuments({
            ...visibilityMatch,
            priority: { $in: highPriorityIds }
        });

        // 3. Ticket count by status
        const statusCounts = await tickets.aggregate([
            { $match: visibilityMatch },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const allStatuses = await statuses.find({}, 'name');
        const ticketByStatus = {};
        allStatuses.forEach(s => ticketByStatus[s.name] = 0);

        statusCounts.forEach(sc => {
            const status = allStatuses.find(s => s._id.toString() === sc._id.toString());
            if (status) {
                ticketByStatus[status.name] = sc.count;
            }
        });

        // 4. Tickets per day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyCounts = await tickets.aggregate([
            {
                $match: {
                    ...visibilityMatch,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const ticketsPerDay = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const match = dailyCounts.find(c => c._id === dateStr);
            ticketsPerDay.push({
                date: dayName,
                count: match ? match.count : 0
            });
        }

        res.status(200).json({
            totalTickets,
            highPriority,
            ticketByStatus,
            ticketsPerDay
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching dashboard metrics" });
    }
};

//Delete :own comment only
exports.deleteComment = async (req, res) => {
    console.log("inside deleteComment")
    try {
        const { ticketId, commentId } = req.params;

        const ticketCheck = await tickets.findById(ticketId).populate('status');
        if (!ticketCheck) return res.status(404).json({ message: "Ticket not found" });
        if (ticketCheck.status?.name?.toLowerCase() === 'closed') {
            return res.status(403).json({ message: "Cannot delete comments from a closed ticket" });
        }

        const ticket = await tickets.findOneAndUpdate(
            {
                _id: ticketId,
                "comments._id": commentId,
                'comments.commentedBy': req.user.id,
            },
            {
                $pull: {
                    comments: {
                        _id: commentId

                    },
                },
                $push: {
                    activityLog: {
                        message: `Comment deleted by agent`,
                    },
                },
            },
            { new: true }
        ).populate("comments.commentedBy", "name role");

        if (!ticket) {
            return res.status(403).json({
                message: "You can delete only your own comments",
            });
        }

        return res.status(200).json(ticket)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}