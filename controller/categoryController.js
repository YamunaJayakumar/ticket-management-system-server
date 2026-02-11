const Categories = require('../model/category')

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Categories.find().populate("assignedTeam", "name");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add category (admin)
exports.addCategory = async (req, res) => {
  try {
    const { name, description, assignedTeam } = req.body;
    const category = new Categories({ name, description, assignedTeam });
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update category (admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, assignedTeam } = req.body;

    const category = await Categories.findByIdAndUpdate(
      id,
      { name, description, assignedTeam },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Categories.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
