const express = require("express");
const userController = require("../controller/usercontroller");
const { validate } = require('../middleware/validate');
const { createUserValidator, loginValidator } = require('../validators/user.validator');
const jwtMiddleware = require("../middleware/jwtMiddleware");
const ticketController = require("../controller/ticketController");
const dashboardController =require('../controller/dashboardController')
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
//get dashboarddata
router.get("/dashboard", jwtMiddleware, dashboardController.getDashboardData);


module.exports = router;
