const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  plan: {
    type: String,
    default: "FREE"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);