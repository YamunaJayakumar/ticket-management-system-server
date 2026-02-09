const Specialization = require('../model/specialization')

//create specialization-admin
exports.createSpecializationController = async (req, res) => {
    console.log("inside createSpecializationController ")
    try {
        const { name, description } = req.body
        const existing = await Specialization.findOne({ name })
        if (existing) {
            return res.status(400).json("Specialization already exists")
        }
        const specialization = await Specialization.create({ name, description })
        res.status(200).json(specialization)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

//get all specializations
exports.getAllSpecializationsController = async (req, res) => {
    console.log("inside getAllSpecializationsController")
    try {
        const specializations = await Specialization.find().sort({ createdAt: -1 })
        res.status(200).json(specializations)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

//get active specializations-agent+user
exports.getActiveSpecializationController = async (req, res) => {
    console.log("inside getActiveSpecializationController ")
    try {
        const specializations = await Specialization.find({ isActive: true }).sort({ name: 1 })
        res.status(200).json(specializations)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

//toggle specialization
exports.toggleSpecializationController = async (req, res) => {
    console.log("inside toggleSpecializationController ")
    try {
        const id = req.params.id
        const specialization = await Specialization.findById(id)
        if (!specialization) {
            return res.status(404).json("Specialization not found")
        }
        specialization.isActive = !specialization.isActive
        await specialization.save()
        res.status(200).json(specialization)
    } catch (err) {
        res.status(500).json(err)
    }
}