const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Updated priority to reference Priority model
    priority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Priorities", // reference the Priorities collection
      required: true,
    },

    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "statuses",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    assignedTeam: {
      type: String,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    comments: [
      {
        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    activityLog: [
      {
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("tickets", ticketSchema);
