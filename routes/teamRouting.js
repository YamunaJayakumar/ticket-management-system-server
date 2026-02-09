const express = require("express");
const {
    getTeams,
    addTeam,
    updateTeam,
    deleteTeam,
    addMember
} = require("../controller/teamController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

router.get("/", jwtMiddleware, getTeams);
router.post("/", jwtMiddleware, adminMiddleware, addTeam);
router.put("/:id", jwtMiddleware, adminMiddleware, updateTeam);
router.patch("/:id/add-member", jwtMiddleware, adminMiddleware, addMember);
router.delete("/:id", jwtMiddleware, adminMiddleware, deleteTeam);

module.exports = router;
