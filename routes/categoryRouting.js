const express = require("express");
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const adminMiddleware =require("../middleware/adminMiddleware")
const router = express.Router();

router.get("/", jwtMiddleware, getCategories);        // all users
router.post("/", jwtMiddleware, adminMiddleware, addCategory); // admin
router.put("/:id", jwtMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", jwtMiddleware, adminMiddleware, deleteCategory);

module.exports = router;