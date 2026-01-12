const router = require("express").Router();
const Guild = require("../models/Guild");

router.get("/:guildId", async (req, res) => {
  const guild = await Guild.findOne({ guildId: req.params.guildId });
  if (!guild) return res.status(404).json({ error: "Not found" });

  res.json(guild);
});

router.post("/:guildId/reset", async (req, res) => {
  const guild = await Guild.findOne({ guildId: req.params.guildId });
  if (!guild) return res.status(404).json({ error: "Not found" });

  guild.usedLines = 0;
  guild.lastReset = new Date();
  await guild.save();

  res.json({ success: true });
});

module.exports = router;