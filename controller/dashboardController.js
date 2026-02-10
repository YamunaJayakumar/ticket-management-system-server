const tickets = require('../model/ticketModel');
const Status = require('../model/status');
const Priority = require('../model/priority');

exports.getDashboardData = async (req, res) => {
  console.log("inside getDashboardData");
  try {
    const userId = req.user.id;
    const role = req.user.role?.toLowerCase();

    let ticketFilter = {};
    if (role !== "admin") {
      ticketFilter = {
        $or: [
          { createdBy: userId },
          { assignedTo: userId }
        ]
      };
    }

    // Fetch all relevant tickets and populate status/priority
    const allTickets = await tickets.find(ticketFilter)
      .populate("status", "name")
      .populate("priority", "name");

    // Basic Counts
    const totalIncidents = allTickets.length;
    const openTickets = allTickets.filter(t => t.status?.name === "Open").length;
    const activeTickets = allTickets.filter(t => !["Closed", "Resolved"].includes(t.status?.name)).length;
    const criticalIncidents = allTickets.filter(t =>
      t.priority?.name === "Critical" && !["Closed", "Resolved"].includes(t.status?.name)
    ).length;

    // Status Distribution
    const incidentsByStatus = {};
    allTickets.forEach(t => {
      const statusName = t.status?.name || "Unassigned";
      incidentsByStatus[statusName] = (incidentsByStatus[statusName] || 0) + 1;
    });

    // Priority Distribution
    const incidentsByPriority = {};
    allTickets.forEach(t => {
      const priorityName = t.priority?.name || "Unassigned";
      incidentsByPriority[priorityName] = (incidentsByPriority[priorityName] || 0) + 1;
    });

    // Weekly Volume (Last 7 Days)
    const weeklyVolumeMap = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      weeklyVolumeMap[dayName] = { day: dayName, incoming: 0, resolved: 0 };
      last7Days.push(dayName);
    }

    allTickets.forEach(ticket => {
      const createdDate = new Date(ticket.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        const dayName = days[createdDate.getDay()];
        if (weeklyVolumeMap[dayName]) {
          weeklyVolumeMap[dayName].incoming += 1;
        }
      }

      if (ticket.status?.name === "Resolved" || ticket.status?.name === "Closed") {
        const updatedDate = new Date(ticket.updatedAt);
        const today = new Date();
        const diffTimeUp = Math.abs(today - updatedDate);
        const diffDaysUp = Math.ceil(diffTimeUp / (1000 * 60 * 60 * 24));
        if (diffDaysUp <= 7) {
          const dayName = days[updatedDate.getDay()];
          if (weeklyVolumeMap[dayName]) {
            weeklyVolumeMap[dayName].resolved += 1;
          }
        }
      }
    });

    const weeklyVolume = last7Days.map(day => weeklyVolumeMap[day]);

    res.status(200).json({
      openTickets,
      activeTickets,
      totalIncidents,
      criticalIncidents,
      incidentsByStatus,
      incidentsByPriority,
      weeklyVolume,
      // Backward compatibility for User Dashboard
      totalTickets: totalIncidents,
      highPriority: criticalIncidents + allTickets.filter(t => t.priority?.name === "High").length,
      ticketByStatus: incidentsByStatus,
      ticketsPerDay: weeklyVolume.map(v => ({ date: v.day, count: v.incoming })),
      // Placeholders for legacy/future features
      slaBreaches: 0,
      onSchedule: totalIncidents - criticalIncidents,
      systemHealth: 100,
      slaCompliance: 100,
      avgResolution: "24h"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};