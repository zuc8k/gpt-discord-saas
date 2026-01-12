const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  // ================== BASIC ==================
  guildId: {
    type: String,
    unique: true,
    required: true
  },

  // ================== PLAN ==================
  plan: {
    type: String,
    enum: ["FREE", "PRIME", "PREMIUM", "MAX"],
    default: "FREE"
  },

  expiresAt: Date,

  // ================== MONTHLY / YEARLY LIMITS ==================
  monthlyLimit: {
    type: Number,
    default: 0
  },

  yearlyLimit: {
    type: Number,
    default: 0
  },

  usedLines: {
    type: Number,
    default: 0
  },

  lastReset: {
    type: Date,
    default: Date.now
  },

  // ================== DAILY LIMITS ==================
  dailyLimit: {
    type: Number,
    default: 0
  },

  usedDailyLines: {
    type: Number,
    default: 0
  },

  lastDailyReset: {
    type: Date,
    default: Date.now
  },

  // ================== COMMAND LIMITS ==================
  // مثال:
  // { ask: 3, upgrade: 1 }
  commandUsage: {
    type: Map,
    of: Number,
    default: {}
  },

  // ================== CHANNELS ==================
  logsChannel: {
    type: String,
    default: null
  },

  gptChannel: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Guild", guildSchema);