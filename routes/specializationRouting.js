const express = require("express");
const specializationController = require('../controller/specializationController')
const jwtMiddleware = require("../middleware/jwtMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware")
const router = express.Router();

//create specialization
router.post('/', jwtMiddleware, adminMiddleware, specializationController.createSpecializationController)
//get all specializations
router.get('/', jwtMiddleware, adminMiddleware, specializationController.getAllSpecializationsController)
//toggle specializations
router.patch('/:id/toggle', jwtMiddleware, adminMiddleware, specializationController.toggleSpecializationController)

//public
router.get('/active', specializationController.getActiveSpecializationController)

module.exports = router
