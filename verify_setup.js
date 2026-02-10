const mongoose = require("mongoose");
require("dotenv").config();
const Team = require("./model/team");

const connectionString = process.env.DBConnection;

async function verifyAll() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        const teams = await Team.find().populate("members", "name");

        console.log("\n--- Team Setup Verification ---");
        teams.forEach(team => {
            console.log(`Team: ${team.name}`);
            console.log(` - Categories: ${team.categories.join(", ") || "None"}`);
            console.log(` - Members: ${team.members.map(m => m.name).join(", ") || "None"}`);
            console.log('---------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verifyAll();
