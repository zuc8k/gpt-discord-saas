const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  token: {
    type: String,
    required: true,
    unique: true
  },

  role: {
    type: String,
    enum: ["OWNER", "ADMIN", "SUPPORT"],
    default: "SUPPORT"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Staff", staffSchema);