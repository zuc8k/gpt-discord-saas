const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  userId: String,
  role: { type: String, default: "ADMIN" }
});

module.exports = mongoose.model("Admin", adminSchema);