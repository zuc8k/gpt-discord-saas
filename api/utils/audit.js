const AuditLog = require("../models/AuditLog");

module.exports = async function logAction({
  staff,
  action,
  guildId,
  details = {}
}) {
  try {
    await AuditLog.create({
      staff: {
        username: staff.username,
        role: staff.role
      },
      action,
      guildId,
      details
    });
  } catch (err) {
    console.error("❌ Audit log error:", err);
  }
};