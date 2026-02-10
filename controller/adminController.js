const users = require("../model/userModel")
const bcrypt = require('bcrypt')
const Teams = require("../model/team");

//add agent
exports.addAgentController = async (req, res) => {
    console.log("inside addAgentController")
    try {
        const { name, email, password, specializations = [], isActive = true } = req.body

        //check required fields
        if (!name || !email || !password) {
            return res.status(400).json("All fields are required")
        }
        //check email si unique
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            return res.status(409).json("agent already exists")
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        //create agent
        const agent = new users({
            name,
            email,
            password: hashedPassword,
            role: 'agent',
            specializations,
            isActive
        })
        await agent.save()
        res.status(200).json({
            _id: agent._id,
            name: agent.name,
            email: agent.email,
            role: agent.role,
            specializations: agent.specializations,
            isActive: agent.isActive
        })

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

}

//get agent list
exports.getAgentController = async (req, res) => {
    console.log("inside getAgentController")
    try {
        const agents = await users.find({ role: "agent" }).select('-password').lean();

        // Populate team name for each agent
        const agentsWithTeams = await Promise.all(agents.map(async (agent) => {
            const team = await Teams.findOne({ members: agent._id }, 'name');
            return {
                ...agent,
                teamName: team ? team.name : 'Unassigned'
            };
        }));

        return res.status(200).json(agentsWithTeams);

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

//edit agent details
exports.updateAgentController = async (req, res) => {
    console.log("Inside updateAgentController")
    const { id } = req.params
    const { name, email, password, specializations, isActive } = req.body
    try {
        const updateData = { name, email, specializations, isActive };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const agent = await users.findOneAndUpdate(
            {
                _id: id, role: "agent"
            },
            updateData,
            { new: true }
        ).select('-password');

        if (!agent) return res.status(404).json("Agent not found")

        res.status(200).json(agent)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

// Get single agent details
exports.getAgentDetailsController = async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await users.findOne({ _id: id, role: "agent" }).select('-password').lean();

        if (!agent) return res.status(404).json("Agent not found");

        const team = await Teams.findOne({ members: agent._id }, 'name');
        agent.teamName = team ? team.name : 'Unassigned';
        agent.teamId = team ? team._id : null;

        res.status(200).json(agent);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

//remove agent
exports.removeAgentController = async (req, res) => {
    console.log("inside reomveAgentController")
    try {
        const { id } = req.params;

        // Remove agent from all teams first
        await Teams.updateMany(
            { members: id },
            { $pull: { members: id } }
        );

        const agent = await users.findOneAndDelete({ _id: id, role: "agent" })
        if (!agent) return res.status(404).json("Agent not found")
        res.status(200).json("agent removed successfully")

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

// Get all users (Admin only)
exports.getAllUsersController = async (req, res) => {
    try {
        const allUsers = await users.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(allUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};