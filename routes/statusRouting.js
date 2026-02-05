const express = require("express");
const {
  getStatuses,
  addStatus,
  updateStatus,
  deleteStatus,
} = require('../controller/statusController');
const jwtMiddleware = require("../middleware/jwtMiddleware");
const adminMiddleware =require("../middleware/adminMiddleware")
const router = express.Router();

router.get("/",jwtMiddleware, getStatuses);          // any logged-in user
router.post("/", jwtMiddleware, adminMiddleware, addStatus); // admin only
router.put("/:id",jwtMiddleware, adminMiddleware, updateStatus);
router.delete("/:id", jwtMiddleware, adminMiddleware, deleteStatus);

module.exports = router;