const Categories = require('../model/category')

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Categories.find();
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

    // Link category to team
    if (assignedTeam) {
      const Team = require("../model/team");
      await Team.findOneAndUpdate(
        { name: assignedTeam },
        { $addToSet: { categories: name } }
      );
    }

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

    const oldCategory = await Categories.findById(id);
    if (!oldCategory) return res.status(404).json({ message: "Category not found" });

    const category = await Categories.findByIdAndUpdate(
      id,
      { name, description, assignedTeam },
      { new: true }
    );

    const Team = require("../model/team");

    // Handle Team Assignment change
    if (oldCategory.assignedTeam !== assignedTeam) {
      // Remove from old team
      if (oldCategory.assignedTeam) {
        await Team.findOneAndUpdate(
          { name: oldCategory.assignedTeam },
          { $pull: { categories: oldCategory.name } }
        );
      }
      // Add to new team
      if (assignedTeam) {
        await Team.findOneAndUpdate(
          { name: assignedTeam },
          { $addToSet: { categories: name } }
        );
      }
    }
    // Handle Name change (if team remains the same)
    else if (oldCategory.name !== name && assignedTeam) {
      await Team.findOneAndUpdate(
        { name: assignedTeam, categories: oldCategory.name },
        { $set: { "categories.$": name } }
      );
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findById(id);

    if (category && category.assignedTeam) {
      const Team = require("../model/team");
      await Team.findOneAndUpdate(
        { name: category.assignedTeam },
        { $pull: { categories: category.name } }
      );
    }

    await Categories.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
