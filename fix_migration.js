const mongoose = require("mongoose");
require("dotenv").config();

const connectionString = process.env.DBConnection;

async function fixMigration() {
    try {
        await mongoose.connect(connectionString);
        console.log("Connected to database.");

        const db = mongoose.connection.db;
        const teams = await db.collection("teams").find({}).toArray();
        const teamMap = {};
        teams.forEach(t => {
            teamMap[t.name] = t._id;
        });

        console.log("Team Map:", teamMap);

        const categories = await db.collection("categories").find({}).toArray();
        console.log(`Checking ${categories.length} categories...`);

        for (const cat of categories) {
            if (typeof cat.assignedTeam === 'string' && teamMap[cat.assignedTeam]) {
                const teamId = teamMap[cat.assignedTeam];
                await db.collection("categories").updateOne(
                    { _id: cat._id },
                    { $set: { assignedTeam: teamId } }
                );
                console.log(`Updated Category "${cat.name}": "${cat.assignedTeam}" (String) -> ${teamId} (ObjectId)`);
            } else {
                console.log(`Category "${cat.name}" already migrated or no matching team for "${cat.assignedTeam}"`);
            }
        }

        const ticketsArr = await db.collection("tickets").find({}).toArray();
        console.log(`Checking ${ticketsArr.length} tickets...`);
        for (const ticket of ticketsArr) {
            if (typeof ticket.assignedTeam === 'string' && teamMap[ticket.assignedTeam]) {
                const teamId = teamMap[ticket.assignedTeam];
                await db.collection("tickets").updateOne(
                    { _id: ticket._id },
                    { $set: { assignedTeam: teamId } }
                );
                console.log(`Updated Ticket "${ticket.title}": "${ticket.assignedTeam}" (String) -> ${teamId} (ObjectId)`);
            }
        }

        console.log("Fix completed.");
        process.exit(0);
    } catch (error) {
        console.error("Fix failed:", error);
        process.exit(1);
    }
}

fixMigration();
