const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // status name like "Open"
  color: { type: String, default: "#000000" }, // optional color for UI
  createdAt: { type: Date, default: Date.now },
});
const statuses =mongoose.model("statuses",statusSchema)
module.exports = statuses