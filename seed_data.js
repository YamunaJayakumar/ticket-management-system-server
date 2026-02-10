const mongoose = require("mongoose");
require("dotenv").config();
const Team = require("./model/team");
const Category = require("./model/category");
const Specialization = require("./model/specialization");

const connectionString = process.env.DBConnection;

const teamsData = [
    { name: "Network & Infrastructure", description: "Handles all connectivity, internet, and server-related issues.", color: "bg-blue-500" },
    { name: "Software & Applications", description: "Responsible for software bugs, app installations, and feature requests.", color: "bg-teal-500" },
    { name: "Hardware & Peripherals", description: "Repairs laptops, printers, and other physical devices.", color: "bg-orange-500" },
    { name: "Security & Access", description: "Manages passwords, MFA, and access permissions.", color: "bg-rose-500" }
];

const categoriesData = [
    { name: "Connectivity Issue", description: "Wi-Fi, VPN, or local network connection failures.", assignedTeam: "Network & Infrastructure" },
    { name: "Software Bug", description: "Errors or crashes occurring within internal applications.", assignedTeam: "Software & Applications" },
    { name: "Hardware Failure", description: "Physical damage or malfunction of office equipment.", assignedTeam: "Hardware & Peripherals" },
    { name: "Access Request", description: "Requesting permissions for specific folders or software.", assignedTeam: "Security & Access" },
    { name: "Password Reset", description: "Standard request for account unlocking or reset.", assignedTeam: "Security & Access" },
    { name: "New Feature Request", description: "Proposals for new software functionality or improvements.", assignedTeam: "Software & Applications" }
];

const specializationsData = [
    { name: "Cloud Computing", description: "Management of AWS, Azure, or Google Cloud services." },
    { name: "Frontend Development", description: "Expertise in React, HTML/CSS, and user interface bugs." },
    { name: "Backend Development", description: "Expertise in Node.js, Databases, and API integrations." },
    { name: "System Administration", description: "Server maintenance, OS patching, and network configurations." },
    { name: "Cybersecurity", description: "Threat detection, firewall rules, and security audits." },
    { name: "Hardware Diagnostics", description: "Expertise in circuit repair, component swaps, and firmware." },
    { name: "IT Support Specialist", description: "General troubleshooting, peripheral setup, and device maintenance." },
    { name: "Identity Management", description: "Expertise in Active Directory, Okta, and permission sets." }
];

async function seed() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        // Seed Specializations
        for (const spec of specializationsData) {
            await Specialization.findOneAndUpdate({ name: spec.name.toLowerCase() }, spec, { upsert: true, new: true });
        }
        console.log("Specializations seeded.");

        // Seed Teams
        for (const team of teamsData) {
            await Team.findOneAndUpdate({ name: team.name }, team, { upsert: true, new: true });
        }
        console.log("Teams seeded.");

        // Seed Categories
        for (const category of categoriesData) {
            await Category.findOneAndUpdate({ name: category.name }, category, { upsert: true, new: true });
        }
        console.log("Categories seeded.");

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
