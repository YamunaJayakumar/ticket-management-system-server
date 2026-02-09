const Statuses = require("../model/status");

// Get all statuses
exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Statuses.find();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new status
exports.addStatus = async (req, res) => {
  try {
    const { name } = req.body;
    const status = new Statuses({ name });
    await status.save();
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an existing status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const status = await Statuses.findByIdAndUpdate(id, { name, color }, { new: true });
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a status
exports.deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await Statuses.findByIdAndDelete(id);
    res.json({ message: "Status deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
