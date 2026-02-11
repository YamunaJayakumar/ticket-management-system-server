const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
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
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        color: {
            type: String,
            default: "bg-teal-500",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("teams", teamSchema);
