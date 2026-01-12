require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");

// ================== CLIENT ==================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================== DATABASE ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));

// ================== COMMANDS (HOT RELOAD) ==================
const { loadCommands } = require("./handlers/commandHandler");
const watchCommands = require("./handlers/commandWatcher");

loadCommands(client);     // تحميل الأوامر أول مرة
watchCommands(client);   // مراقبة أي تعديل في فولدر commands

// ================== EVENTS (HOT RELOAD) ==================
const { loadEvents } = require("./handlers/eventHandler");
const watchEvents = require("./handlers/eventWatcher");

loadEvents(client);      // تحميل الأحداث أول مرة
watchEvents(client);    // مراقبة أي تعديل في فولدر events

// ================== READY ==================
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN);