const router = require("express").Router();
const Guild = require("../models/Guild");
const { countLines } = require("../shared/utils");
const { shouldResetDaily } = require("../shared/resetDaily");
const { isBlocked } = require("../services/contentFilter");

/*
  POST /chat/send
  Headers:
    Authorization: STAFF_TOKEN أو USER_TOKEN (لو حابب)

  Body:
    {
      guildId: "123",
      message: "Hello GPT"
    }
*/

router.post("/send", async (req, res) => {
  try {
    const { guildId, message } = req.body;

    if (!guildId || !message?.trim()) {
      return res.status(400).json({ error: "Missing data" });
    }

    // ================== GET GUILD ==================
    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ error: "Guild not found" });
    }

    // ================== RESET DAILY (AUTO) ==================
    if (shouldResetDaily(guild.lastDailyReset)) {
      guild.usedDailyLines = 0;
      guild.lastDailyReset = new Date();
      await guild.save();
    }

    // ================== EXPIRED ==================
    if (guild.expiresAt && Date.now() > guild.expiresAt) {
      return res.status(403).json({
        code: "EXPIRED",
        message: "Subscription expired"
      });
    }

    // ================== CONTENT FILTER ==================
    if (isBlocked(message)) {
      return res.status(403).json({
        code: "BLOCKED",
        message: "Message not allowed"
      });
    }

    // ================== COUNT LINES ==================
    const userLines = countLines(message);

    if (userLines > 500) {
      return res.status(400).json({
        code: "TOO_LONG",
        message: "Message too long"
      });
    }

    // ================== DAILY LIMIT ==================
    if (guild.usedDailyLines + userLines > guild.dailyLimit) {
      return res.status(403).json({
        code: "DAILY_LIMIT",
        message: "Daily limit reached",
        usage: {
          used: guild.usedDailyLines,
          limit: guild.dailyLimit
        }
      });
    }

    // ================== MONTHLY LIMIT ==================
    if (guild.usedLines + userLines > guild.monthlyLimit) {
      return res.status(403).json({
        code: "MONTHLY_LIMIT",
        message: "Monthly limit reached",
        usage: {
          used: guild.usedLines,
          limit: guild.monthlyLimit
        }
      });
    }

    // ================== GPT PLACEHOLDER ==================
    // 🔥 هنا بعدين تربط OpenAI / Local LLM
    const replyText = `🤖 GPT says:\n"${message}"`;

    const botLines = countLines(replyText);
    const totalLines = userLines + botLines;

    // ================== UPDATE USAGE ==================
    guild.usedDailyLines += totalLines;
    guild.usedLines += totalLines;
    await guild.save();

    // ================== RESPONSE ==================
    res.json({
      reply: replyText,
      plan: guild.plan,
      usage: {
        daily: guild.usedDailyLines,
        dailyLimit: guild.dailyLimit,
        monthly: guild.usedLines,
        monthlyLimit: guild.monthlyLimit
      }
    });

  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;