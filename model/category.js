const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    assignedTeam: {
      type: String, // Storing name for now, or could refer to Team model
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("categories", categorySchema);