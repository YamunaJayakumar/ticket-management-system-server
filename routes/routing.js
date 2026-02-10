const express = require("express");
const userController = require("../controller/usercontroller");
const { validate } = require('../middleware/validate');
const { createUserValidator, loginValidator } = require('../validators/user.validator');
const jwtMiddleware = require("../middleware/jwtMiddleware");
const ticketController = require("../controller/ticketController");
const dashboardController = require('../controller/dashboardController')
const adminMiddleware = require("../middleware/adminMiddleware")
const adminController = require('../controller/adminController')
const agentMiddleware = require('../middleware/agentMiddleware')
const agentController = require('../controller/agentController')

const router = express.Router();

// -------- Public Routes --------
router.post("/auth/register", validate(createUserValidator), userController.registerController);
router.post("/auth/login", validate(loginValidator), userController.loginController);

// -------- Protected Routes ----------------------------------------------------------
//create ticket by admin and user
router.post("/ticket/create", jwtMiddleware, ticketController.createTicketController);
//view ticketslist by admin and user
router.get("/ticket/list", jwtMiddleware, ticketController.viewTicketController);
//get ticket details
router.get("/ticket/:id", ticketController.getTicketDetailsController);
//update ticket
router.patch("/ticket/update/:id", jwtMiddleware, ticketController.updateTicketController);
//get dashboarddata-for admin and user
router.get("/dashboard", jwtMiddleware, dashboardController.getDashboardData);

//-----------------------admin routes------------------------------------------------------
//add agent
router.post('/admin/agents', jwtMiddleware, adminMiddleware, adminController.addAgentController)
//get agent list
router.get('/admin/agents', jwtMiddleware, adminMiddleware, adminController.getAgentController)
//get agent details
router.get('/admin/agents/:id', jwtMiddleware, adminMiddleware, adminController.getAgentDetailsController)
//update agent
router.put('/admin/agents/:id', jwtMiddleware, adminMiddleware, adminController.updateAgentController)
//remove agent
router.delete('/admin/agents/:id', jwtMiddleware, adminMiddleware, adminController.removeAgentController)

//get all users (admin only)
router.get('/admin/users', jwtMiddleware, adminMiddleware, adminController.getAllUsersController)

//--------------------------agentRoutes-----------------
router.get("/agent/dashboard", jwtMiddleware, agentMiddleware, agentController.getAgentDashboardMetrics)
router.get("/agent/tickets", jwtMiddleware, agentMiddleware, agentController.getMyTicket)
router.get("/agent/tickets/:id", jwtMiddleware, agentMiddleware, agentController.getSingleTicketDetails)
router.patch("/agent/tickets/:id/status", jwtMiddleware, agentMiddleware, agentController.updateTicketStatus)
router.post("/agent/tickets/:id/comments", jwtMiddleware, agentMiddleware, agentController.addComment)
router.delete("/agent/tickets/:ticketId/comments/:commentId", jwtMiddleware, agentMiddleware, agentController.deleteComment)

module.exports = router;
