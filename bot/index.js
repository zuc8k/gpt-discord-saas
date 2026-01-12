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
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1); // وقف البوت لو DB وقعت
  }
})();

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

// ================== GRACEFUL SHUTDOWN ==================
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await mongoose.disconnect();
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down...");
  await mongoose.disconnect();
  client.destroy();
  process.exit(0);
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN).catch(err => {
  console.error("❌ Discord Login Failed:", err);
  process.exit(1);
});