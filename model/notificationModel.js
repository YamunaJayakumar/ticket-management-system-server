const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tickets",
        },
        type: {
            type: String,
            enum: ["assigned", "commented", "status_updated", "closure"],
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("notifications", notificationSchema);
