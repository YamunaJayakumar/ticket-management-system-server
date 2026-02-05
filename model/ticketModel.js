const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Low"
    },
    status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved", "Closed"],  // fixed
        default: "Open"
    },
    category: {
        type: String,
        default: "Others"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    activityLog: [
        {
            message: {
                type: String
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const tickets = mongoose.model("tickets", ticketSchema);
module.exports = tickets;
