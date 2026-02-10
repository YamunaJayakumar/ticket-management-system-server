const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./model/userModel");
const Team = require("./model/team");

const connectionString = process.env.DBConnection;

const agentsData = [
    {
        name: "John Network",
        email: "network@example.com",
        password: "password123",
        specializations: ["cloud computing", "system administration"],
        teamName: "Network & Infrastructure"
    },
    {
        name: "Sarah Software",
        email: "software@example.com",
        password: "password123",
        specializations: ["frontend development", "backend development"],
        teamName: "Software & Applications"
    },
    {
        name: "Harry Hardware",
        email: "hardware@example.com",
        password: "password123",
        specializations: ["hardware diagnostics", "it support specialist"],
        teamName: "Hardware & Peripherals"
    },
    {
        name: "Sam Security",
        email: "security@example.com",
        password: "password123",
        specializations: ["cybersecurity", "identity management"],
        teamName: "Security & Access"
    }
];

async function seedAgents() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        for (const agentData of agentsData) {
            // 1. Create agent if not exists
            let agent = await User.findOne({ email: agentData.email });

            if (!agent) {
                const hashedPassword = await bcrypt.hash(agentData.password, 10);
                agent = new User({
                    name: agentData.name,
                    email: agentData.email,
                    password: hashedPassword,
                    role: 'agent',
                    specializations: agentData.specializations,
                    isActive: true
                });
                await agent.save();
                console.log(`Agent ${agent.name} created.`);
            } else {
                console.log(`Agent ${agent.email} already exists.`);
            }

            // 2. Add to team
            const team = await Team.findOne({ name: agentData.teamName });
            if (team) {
                if (!team.members.includes(agent._id)) {
                    team.members.push(agent._id);
                    await team.save();
                    console.log(`Agent ${agent.name} added to team ${team.name}.`);
                } else {
                    console.log(`Agent ${agent.name} already in team ${team.name}.`);
                }
            } else {
                console.log(`Team ${agentData.teamName} not found.`);
            }
        }

        console.log("Agent seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Agent seeding failed:", error);
        process.exit(1);
    }
}

seedAgents();
