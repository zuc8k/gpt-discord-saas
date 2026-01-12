const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  staff: {
    username: String,
    role: String
  },

  action: {
    type: String,
    required: true
  },

  guildId: String,

  details: Object,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);