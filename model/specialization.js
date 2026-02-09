const mongoose = require("mongoose")

const specializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
)

const Specialization = mongoose.model("specializations", specializationSchema)
module.exports = Specialization