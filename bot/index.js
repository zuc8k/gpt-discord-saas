require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

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

// ================== EVENTS HANDLER ==================
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file =>
  file.endsWith(".js")
);

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);

  try {
    const event = require(filePath);
    const eventName = file.split(".")[0];

    client.on(eventName, (...args) => event(client, ...args));
    console.log(`📡 Loaded Event: ${eventName}`);

  } catch (err) {
    console.error(`❌ Failed to load event ${file}`, err);
  }
}

// ================== READY ==================
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN);