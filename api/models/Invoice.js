const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  guildId: String,

  plan: {
    type: String,
    enum: ["PRIME", "PREMIUM", "MAX"]
  },

  duration: {
    type: String,
    enum: ["monthly", "yearly"]
  },

  amount: Number,
  currency: {
    type: String,
    default: "USD"
  },

  method: {
    type: String,
    enum: ["VODAFONE", "STRIPE"]
  },

  status: {
    type: String,
    enum: ["PENDING", "PAID", "REJECTED"],
    default: "PENDING"
  },

  proofImage: String, // Vodafone Cash
  stripeSessionId: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);