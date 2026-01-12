const fs = require("fs");
const path = require("path");

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "../events");
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

  // نخزن الريفرنس عشان نقدر نفصله
  if (!client._eventsMap) client._eventsMap = new Map();

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const eventName = file.split(".")[0];

    try {
      // لو كان محمّل قبل كده → نشيله
      if (client._eventsMap.has(eventName)) {
        client.off(eventName, client._eventsMap.get(eventName));
        client._eventsMap.delete(eventName);
      }

      delete require.cache[require.resolve(filePath)];
      const event = require(filePath);

      const handler = (...args) => event(client, ...args);
      client.on(eventName, handler);

      client._eventsMap.set(eventName, handler);

      console.log(`📡 Loaded Event: ${eventName}`);
    } catch (err) {
      console.error(`❌ Failed to load event ${eventName}`, err);
    }
  }
}

module.exports = { loadEvents };