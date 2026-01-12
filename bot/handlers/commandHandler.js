const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.commands = new Map();

  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      // Validation
      if (!command.data || !command.execute) {
        console.warn(`⚠️ Command ${file} is missing data or execute`);
        continue;
      }

      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded Command: ${command.data.name}`);

    } catch (err) {
      console.error(`❌ Failed to load command ${file}`, err);
    }
  }
};