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
      type: mongoose.Schema.Types.ObjectId,
      ref: "teams",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("categories", categorySchema);