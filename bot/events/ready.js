const { REST, Routes } = require("discord.js");
const fs = require("fs");

module.exports = async (client) => {
  console.log(`✅ Logged as ${client.user.tag}`);

  const commands = [];
  const commandFiles = fs.readdirSync("./bot/commands").filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("🚀 Slash Commands Registered");
};