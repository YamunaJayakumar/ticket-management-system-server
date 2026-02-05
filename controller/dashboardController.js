const mongoose = require("mongoose");
const tickets = require("../model/ticketModel");
const Priorities = require("../model/priority");

exports.getDashboardData = async (req, res) => {
  try {
    // Convert user ID to ObjectId correctly
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const role = req.user.role;

    // Build ticket filter based on role
    const ticketFilter =
      role === "admin"
        ? {}
        : { $or: [{ createdBy: userId }, { assignedTo: userId }] };

    // Total tickets
    const totalTickets = await tickets.countDocuments(ticketFilter);

    // High priority tickets
    const highPriorityDocs = await Priorities.find({ name: { $in: ["High", "Critical"] } });
    const highPriorityIds = highPriorityDocs.map((p) => p._id);

    const highPriority = await tickets.countDocuments({
      ...ticketFilter,
      priority: { $in: highPriorityIds },
    });

    // Tickets by status
    const ticketsByStatusAgg = await tickets.aggregate([
      { $match: ticketFilter },
      {
        $lookup: {
          from: "statuses",
          localField: "status",
          foreignField: "_id",
          as: "statusData",
        },
      },
      { $unwind: { path: "$statusData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$statusData.name",
          count: { $sum: 1 },
        },
      },
    ]);

    const ticketsByStatus = {};
    ticketsByStatusAgg.forEach((s) => (ticketsByStatus[s._id || "Unassigned"] = s.count));

    // Tickets per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const ticketsPerDayAgg = await tickets.aggregate([
      { $match: { ...ticketFilter, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalTickets,
      highPriority,
      ticketsByStatus,
      ticketsPerDay: ticketsPerDayAgg.map((d) => ({ date: d._id, count: d.count })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
