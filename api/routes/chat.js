const router = require("express").Router();
const Guild = require("../models/Guild");
const staffAuth = require("../middlewares/staffAuth");

/*
  POST /chat/send
  body: { guildId, message }
*/
router.post("/send", async (req, res) => {
  const { guildId, message } = req.body;

  if (!guildId || !message) {
    return res.status(400).json({ error: "Missing data" });
  }

  const guild = await Guild.findOne({ guildId });
  if (!guild) return res.status(404).json({ error: "Guild not found" });

  // ================== CHECK EXPIRE ==================
  if (guild.expiresAt && Date.now() > guild.expiresAt) {
    return res.status(403).json({
      code: "EXPIRED",
      message: "Subscription expired"
    });
  }

  // ================== CHECK LIMIT ==================
  if (guild.usedDailyLines >= guild.dailyLimit) {
    return res.status(403).json({
      code: "DAILY_LIMIT",
      message: "Daily limit reached"
    });
  }

  // ================== GPT PLACEHOLDER ==================
  const reply = `🤖 GPT reply to: "${message}"`;

  // ================== UPDATE USAGE ==================
  guild.usedDailyLines += 1;
  guild.usedLines += 1;
  await guild.save();

  res.json({
    reply,
    usage: {
      daily: guild.usedDailyLines,
      dailyLimit: guild.dailyLimit
    },
    plan: guild.plan
  });
});

module.exports = router;