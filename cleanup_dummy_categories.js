const mongoose = require('mongoose');
require('dotenv').config();
require('./config/db');
const Team = require('./model/team');
const Category = require('./model/category');

async function cleanup() {
    try {
        console.log("Starting dummy category cleanup...");

        // Wait for DB connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 1. Get all valid categories
        const validCategories = await Category.find();
        const validNames = new Set(validCategories.map(c => c.name));
        console.log(`Found ${validNames.size} valid categories in the database.`);

        // 2. Get all teams
        const teams = await Team.find();
        let totalRemoved = 0;

        for (const team of teams) {
            const originalCount = team.categories.length;
            const updatedCategories = team.categories.filter(cat => validNames.has(cat));

            if (updatedCategories.length !== originalCount) {
                const removedCount = originalCount - updatedCategories.length;
                console.log(`Team "${team.name}": Removing ${removedCount} dummy categories.`);
                team.categories = updatedCategories;
                await team.save();
                totalRemoved += removedCount;
            }
        }

        console.log(`Cleanup complete. Total dummy categories removed: ${totalRemoved}`);
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
