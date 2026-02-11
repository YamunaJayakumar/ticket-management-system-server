const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("./model/category");
const Team = require("./model/team");

const connectionString = process.env.DBConnection;

async function debug() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        const categories = await Category.find().populate("assignedTeam", "name");
        console.log("\n--- Categories ---");
        categories.forEach(cat => {
            console.log(`Category: ${cat.name}`);
            console.log(` - Assigned Team: ${cat.assignedTeam ? cat.assignedTeam.name : "None"} (${cat.assignedTeam ? cat.assignedTeam._id : "N/A"})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Debug failed:", error);
        process.exit(1);
    }
}

debug();
