// models/priorityModel.js
const mongoose = require("mongoose");

const prioritySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., Low, Medium, High, Critical
      trim: true,
    },
    color: {
      type: String,
      default: "#000000", // optional: store a color code for UI
    },
    description: {
      type: String, // optional: describe what this priority means
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // usually the admin who created it
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Priorities", prioritySchema);
