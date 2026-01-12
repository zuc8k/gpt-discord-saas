const fs = require("fs");
const path = require("path");
const { loadEvents } = require("./eventHandler");

module.exports = (client) => {
  const eventsPath = path.join(__dirname, "../events");

  fs.watch(eventsPath, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    console.log(`🔄 Event change detected: ${filename}`);
    loadEvents(client);
  });
};