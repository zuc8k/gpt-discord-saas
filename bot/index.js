require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");

// ================== CLIENT ==================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,          // Slash commands + guildCreate
    GatewayIntentBits.GuildMessages,   // رسائل السيرفر
    GatewayIntentBits.MessageContent   // محتوى الرسائل (GPT)
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

loadCommands(client);     // تحميل الأوامر
watchCommands(client);   // مراقبة أي تعديل في commands

// ================== EVENTS (HOT RELOAD) ==================
const { loadEvents } = require("./handlers/eventHandler");
const watchEvents = require("./handlers/eventWatcher");

loadEvents(client);      // تحميل كل Events تلقائي
watchEvents(client);    // Hot reload للأحداث

// ================== READY ==================
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
  console.log(`📡 Servers: ${client.guilds.cache.size}`);
});

// ================== GRACEFUL SHUTDOWN ==================
async function shutdown() {
  console.log("🛑 Shutting down...");
  try {
    await mongoose.disconnect();
  } catch {}
  client.destroy();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN).catch(err => {
  console.error("❌ Discord Login Failed:", err);
  process.exit(1);
});