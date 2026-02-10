const mongoose = require("mongoose");
require("dotenv").config();
const Team = require("./model/team");
const User = require("./model/userModel");

const connectionString = process.env.DBConnection;

async function verify() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        const teams = await Team.find().populate("members", "name email");

        console.log("\n--- Team Roster ---");
        teams.forEach(team => {
            console.log(`Team: ${team.name}`);
            if (team.members && team.members.length > 0) {
                team.members.forEach(member => {
                    console.log(` - Member: ${member.name} (${member.email})`);
                });
            } else {
                console.log(" - No members assigned.");
            }
        });

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verify();
