// controllers/priorityController.js
const Priority = require('../model/priority')

// Create a new priority (Admin only)
exports.createPriority = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Priority name is required" });
    }

    const existing = await Priority.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Priority already exists" });
    }

    const priority = await Priority.create({
      name,
      color,
      description,
      createdBy: req.user._id, // assuming you have user from auth middleware
    });

    res.status(201).json({ message: "Priority created successfully", data: priority });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all priorities
exports.getPriorities = async (req, res) => {
  try {
    const priorities = await Priority.find().sort({ createdAt: 1 }); // oldest first
    res.status(200).json(priorities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a priority (Admin only)
exports.updatePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    const priority = await Priority.findByIdAndUpdate(
      id,
      { name, color, description },
      { new: true }
    );

    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }

    res.status(200).json({ message: "Priority updated successfully", data: priority });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a priority (Admin only)
exports.deletePriority = async (req, res) => {
  try {
    const { id } = req.params;

    const priority = await Priority.findByIdAndDelete(id);

    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }

    res.status(200).json({ message: "Priority deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
