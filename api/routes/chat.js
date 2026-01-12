const router = require("express").Router();
const Guild = require("../models/Guild");
const ChatMessage = require("../models/ChatMessage");

const { countLines } = require("../shared/utils");
const { shouldResetDaily } = require("../shared/resetDaily");
const { isBlocked } = require("../services/contentFilter");

/*
  POST /chat/send
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

    // ================== RESET DAILY ==================
    if (shouldResetDaily(guild.lastDailyReset)) {
      guild.usedDailyLines = 0;
      guild.lastDailyReset = new Date();
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

    // ================== COUNT USER LINES ==================
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

    // ================== SAVE USER MESSAGE ==================
    await ChatMessage.create({
      guildId,
      role: "user",
      content: message,
      plan: guild.plan
    });

    // ================== GPT PLACEHOLDER ==================
    // 🔥 هنا بعدين تربط OpenAI / Groq / Local LLM
    const replyText = `🤖 GPT says:\n"${message}"`;

    const botLines = countLines(replyText);
    const totalLines = userLines + botLines;

    // ================== CHECK BOT USAGE ==================
    if (guild.usedDailyLines + totalLines > guild.dailyLimit) {
      return res.status(403).json({
        code: "DAILY_LIMIT",
        message: "Daily limit reached after response"
      });
    }

    // ================== SAVE BOT MESSAGE ==================
    await ChatMessage.create({
      guildId,
      role: "assistant",
      content: replyText,
      plan: guild.plan
    });

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

/*
  GET /chat/history/:guildId
*/
router.get("/history/:guildId", async (req, res) => {
  try {
    const { guildId } = req.params;

    const messages = await ChatMessage
      .find({ guildId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);

  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
});

module.exports = router;