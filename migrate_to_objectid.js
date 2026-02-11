const mongoose = require("mongoose");
require("dotenv").config();
const Team = require("./model/team");
const Category = require("./model/category");
const Ticket = require("./model/ticketModel");

const connectionString = process.env.DBConnection;

async function migrate() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        const teams = await Team.find({});
        const teamMap = {}; // name -> _id
        teams.forEach(t => {
            teamMap[t.name] = t._id;
        });

        console.log("Found teams:", Object.keys(teamMap));

        // 1. Migrate Categories
        const categories = await Category.find({});
        console.log(`Migrating ${categories.length} categories...`);
        for (const cat of categories) {
            if (typeof cat.assignedTeam === 'string' && cat.assignedTeam !== "") {
                const teamId = teamMap[cat.assignedTeam];
                if (teamId) {
                    cat.assignedTeam = teamId;
                    await cat.save();
                    console.log(`Updated Category "${cat.name}": ${cat.assignedTeam} (String) -> ${teamId} (ObjectId)`);
                } else {
                    console.warn(`Warning: Team "${cat.assignedTeam}" not found for category "${cat.name}"`);
                }
            }
        }

        // 2. Migrate Tickets
        const tickets = await Ticket.find({});
        console.log(`Migrating ${tickets.length} tickets...`);
        for (const ticket of tickets) {
            if (typeof ticket.assignedTeam === 'string' && ticket.assignedTeam !== "") {
                const teamId = teamMap[ticket.assignedTeam];
                if (teamId) {
                    ticket.assignedTeam = teamId;
                    await ticket.save();
                    console.log(`Updated Ticket "${ticket.title}": ${ticket.assignedTeam} (String) -> ${teamId} (ObjectId)`);
                } else {
                    console.warn(`Warning: Team "${ticket.assignedTeam}" not found for ticket "${ticket.title}"`);
                }
            }
        }

        // 3. Cleanup: Teams no longer have categories array, but Mongoose might still keep it in the doc if we don't unset it.
        // However, we removed it from the schema, so it won't be visible in queries normally.
        // If we want to be thorough, we can $unset it.
        console.log("Cleaning up Team documents...");
        await Team.updateMany({}, { $unset: { categories: "" } });

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
