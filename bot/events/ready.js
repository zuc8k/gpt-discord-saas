require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  try {
    const commands = [];

    // قراءة كل ملفات الأوامر
    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));

      // حماية لو ملف ناقص data
      if (!command.data || !command.execute) {
        console.warn(`⚠️ Skipped invalid command: ${file}`);
        continue;
      }

      commands.push(command.data.toJSON());
    }

    // REST API
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

    // تسجيل أوامر Global (أي حد يضيف البوت)
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log(`🚀 ${commands.length} Slash Commands Registered Globally`);

  } catch (err) {
    console.error("❌ Failed to register slash commands:", err);
  }
};