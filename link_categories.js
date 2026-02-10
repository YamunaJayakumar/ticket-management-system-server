const mongoose = require("mongoose");
require("dotenv").config();
const Team = require("./model/team");
const Category = require("./model/category");

const connectionString = process.env.DBConnection;

const mapping = [
    { teamName: "Network & Infrastructure", categories: ["Connectivity Issue"] },
    { teamName: "Software & Applications", categories: ["Software Bug", "New Feature Request"] },
    { teamName: "Hardware & Peripherals", categories: ["Hardware Failure"] },
    { teamName: "Security & Access", categories: ["Access Request", "Password Reset"] }
];

async function linkCategories() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        for (const item of mapping) {
            const team = await Team.findOne({ name: item.teamName });
            if (team) {
                // Update team's categories array
                // Avoid duplicates
                const updatedCategories = [...new Set([...team.categories, ...item.categories])];
                team.categories = updatedCategories;
                await team.save();
                console.log(`Linked categories [${item.categories.join(", ")}] to team ${team.name}.`);
            } else {
                console.log(`Team ${item.teamName} not found.`);
            }
        }

        console.log("Category linkage completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Linkage failed:", error);
        process.exit(1);
    }
}

linkCategories();
