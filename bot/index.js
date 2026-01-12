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

// ================== COMMAND HANDLER ==================
const loadCommands = require("./handlers/commandHandler");
loadCommands(client);

// ================== EVENTS HANDLER ==================
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  const eventName = file.split(".")[0];

  client.on(eventName, (...args) => event(client, ...args));
}

// ================== READY ==================
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN);