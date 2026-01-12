const fs = require("fs");
const path = require("path");
const { loadCommands } = require("./commandHandler");

module.exports = (client) => {
  const commandsPath = path.join(__dirname, "../commands");

  fs.watch(commandsPath, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    console.log(`🔄 Commands change detected: ${filename}`);
    loadCommands(client);
  });
};