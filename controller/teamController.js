const Teams = require("../model/team");

// Helper to check if any of the members are already assigned to a team
const checkMembersAvailability = async (memberIds, excludeTeamId = null) => {
    const query = { members: { $in: memberIds } };
    if (excludeTeamId) {
        query._id = { $ne: excludeTeamId };
    }
    const existingTeam = await Teams.findOne(query);
    return existingTeam;
};

// Get all teams
exports.getTeams = async (req, res) => {
    try {
        const teams = await Teams.find().populate("members", "name email");
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add team
exports.addTeam = async (req, res) => {
    try {
        const { name, description, members, categories, color } = req.body;

        // Validation: Agent can only be in one team
        if (members && members.length > 0) {
            const alreadyAssigned = await checkMembersAvailability(members);
            if (alreadyAssigned) {
                return res.status(400).json({ message: `One or more agents are already assigned to the "${alreadyAssigned.name}" team.` });
            }
        }

        const team = new Teams({ name, description, members, color });
        await team.save();

        // Update Categories collection to link this team
        if (categories && categories.length > 0) {
            const Category = require("../model/category");
            // categories could be an array of IDs or names. 
            // If the frontend sends IDs (preferred), use _id. If names, use name.
            // For now, let's assume names or IDs and handle both if possible, 
            // but let's stick to the refactor's goal: ObjectId.
            await Category.updateMany(
                { _id: { $in: categories } },
                { assignedTeam: team._id }
            );
        }

        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update team
exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, members, categories, color } = req.body;

        // Validation: Agent can only be in one team
        if (members && members.length > 0) {
            const alreadyAssigned = await checkMembersAvailability(members, id);
            if (alreadyAssigned) {
                return res.status(400).json({ message: `One or more agents are already assigned to the "${alreadyAssigned.name}" team.` });
            }
        }

        const team = await Teams.findByIdAndUpdate(
            id,
            { name, description, members, color },
            { new: true }
        ).populate("members", "name email");

        // Update Categories collection to link this team
        if (categories && categories.length > 0) {
            const Category = require("../model/category");
            // First clear previous assignments for this team
            await Category.updateMany(
                { assignedTeam: team._id },
                { assignedTeam: null }
            );
            // Then set new ones
            await Category.updateMany(
                { _id: { $in: categories } },
                { assignedTeam: team._id }
            );
        }

        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete team
exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Teams.findById(id);

        if (team) {
            const Category = require("../model/category");
            // Clear assignedTeam for all categories linked to this team ID
            await Category.updateMany(
                { assignedTeam: team._id },
                { assignedTeam: null }
            );
        }

        await Teams.findByIdAndDelete(id);
        res.json({ message: "Team deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add member to team
exports.addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;

        const team = await Teams.findById(id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.members.includes(memberId)) {
            return res.status(400).json({ message: "Member already exists in this team" });
        }

        // Validation: Agent can only be in one team
        const alreadyAssigned = await checkMembersAvailability([memberId]);
        if (alreadyAssigned) {
            return res.status(400).json({ message: `This agent is already assigned to the "${alreadyAssigned.name}" team.` });
        }

        team.members.push(memberId);
        await team.save();

        const updatedTeam = await Teams.findById(id).populate("members", "name email");
        res.json(updatedTeam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
