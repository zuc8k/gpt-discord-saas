const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },

  plan: { type: String, default: "FREE" },

  expiresAt: Date,

  monthlyLimit: Number,
  yearlyLimit: Number,

  usedLines: { type: Number, default: 0 },

  lastReset: Date,

  logsChannel: String,
  gptChannel: String
}, { timestamps: true });

module.exports = mongoose.model("Guild", guildSchema);