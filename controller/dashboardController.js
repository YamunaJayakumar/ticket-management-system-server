const tickets = require('../model/ticketModel')
exports.getDashboardData = async (req, res) => {
  console.log("inside getDashboardData");
  try {
    const userId = req.user.id
    const role = req.user.role
    console.log(userId, role)

    let ticketFilter = {}
    if (role !== "admin") {
      ticketFilter = {
        $or: [
          { createdBy: userId },
          { assignedTo: userId }
        ]
      }
    }
    //fetch tickets
    const allTickets = await tickets.find(ticketFilter).populate("status", "name").populate("priority", "name")

    //total ticket
    const totalTickets = allTickets.length
    //high priority ticket
    const highPriority = allTickets.filter(ticket => ["high", "critical"].includes(ticket.priority?.name?.toLowerCase())).length
    //ticket by status

    let ticketByStatus = {}
    allTickets.forEach(ticket => {
      const status = ticket.status?.name || "unassigned"
      ticketByStatus[status] = (ticketByStatus[status] || 0
      ) + 1
    })
    //tickets created by last 7 days
   const ticketsPerDayMap = {};
   const today = new Date();
today.setHours(0, 0, 0, 0);

allTickets.forEach(ticket => {
  const createdDate = new Date(ticket.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  const diffInDays =
    (today - createdDate) / (1000 * 60 * 60 * 24);

  if (diffInDays >= 0 && diffInDays < 7) {
    const label = createdDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit"
    });

    ticketsPerDayMap[label] =
      (ticketsPerDayMap[label] || 0) + 1;
  }

});
//
    
//converts this to object
const ticketsPerDay =Object.entries(ticketsPerDayMap).map(
   ([date, count]) => ({ date, count })
)




    
    res.status(200).json({
      totalTickets,
      highPriority,
      ticketByStatus,
      ticketsPerDay
    })

  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }


}