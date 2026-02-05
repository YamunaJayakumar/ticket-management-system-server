const express = require("express");
const {
  getPriorities,
  createPriority,
  updatePriority,
  deletePriority,
} = require('../controller/priorityController')
const jwtMiddleware = require("../middleware/jwtMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Routes
router.get("/", jwtMiddleware, getPriorities);                    // any logged-in user
router.post("/", jwtMiddleware, adminMiddleware, createPriority); // admin only
router.put("/:id", jwtMiddleware, adminMiddleware, updatePriority);
router.delete("/:id", jwtMiddleware, adminMiddleware, deletePriority);

module.exports = router;
