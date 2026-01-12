const router = require("express").Router();
const Guild = require("../models/Guild");
const ChatMessage = require("../models/ChatMessage");

const multer = require("multer");
const path = require("path");

const { countLines } = require("../shared/utils");
const { shouldResetDaily } = require("../shared/resetDaily");
const { isBlocked } = require("../services/contentFilter");
const { askGPT } = require("../services/openai");

/* ================== MULTER CONFIG ================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `chat-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only images allowed"));
    } else {
      cb(null, true);
    }
  }
});

/*
  POST /chat/send
  FormData:
    guildId
    message (optional)
    image (optional)
*/
router.post("/send", upload.single("image"), async (req, res) => {
  try {
    const { guildId, message = "" } = req.body;
    const imageFile = req.file;

    /* ================== VALIDATION ================== */
    if (!guildId || (!message.trim() && !imageFile)) {
      return res.status(400).json({ error: "Missing data" });
    }

    /* ================== GET GUILD ================== */
    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ error: "Guild not found" });
    }

    /* ================== DAILY RESET ================== */
    if (shouldResetDaily(guild.lastDailyReset)) {
      guild.usedDailyLines = 0;
      guild.lastDailyReset = new Date();
      await guild.save();
    }

    /* ================== EXPIRED ================== */
    if (guild.expiresAt && Date.now() > guild.expiresAt) {
      return res.status(403).json({
        code: "EXPIRED",
        message: "Subscription expired"
      });
    }

    /* ================== CONTENT FILTER (TEXT ONLY) ================== */
    if (message && isBlocked(message)) {
      return res.status(403).json({
        code: "BLOCKED",
        message: "Message not allowed"
      });
    }

    /* ================== COUNT USER LINES ================== */
    const userLines = message ? countLines(message) : 1;

    if (userLines > 500) {
      return res.status(400).json({
        code: "TOO_LONG",
        message: "Message too long"
      });
    }

    /* ================== LIMIT CHECK (USER) ================== */
    if (guild.usedDailyLines + userLines > guild.dailyLimit) {
      return res.status(403).json({
        code: "DAILY_LIMIT",
        message: "Daily limit reached"
      });
    }

    if (guild.usedLines + userLines > guild.monthlyLimit) {
      return res.status(403).json({
        code: "MONTHLY_LIMIT",
        message: "Monthly limit reached"
      });
    }

    /* ================== IMAGE URL ================== */
    const imageUrl = imageFile
      ? `/uploads/chat/${imageFile.filename}`
      : null;

    /* ================== SAVE USER MESSAGE ================== */
    await ChatMessage.create({
      guildId,
      role: "user",
      content: message,
      imageUrl,
      plan: guild.plan
    });

    /* ================== LOAD CONTEXT ================== */
    const history = await ChatMessage.find({ guildId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const messagesForGPT = history
      .reverse()
      .map(m => ({
        role: m.role,
        content: m.content || ""
      }));

    messagesForGPT.push({
      role: "user",
      content: message || "Analyze the image"
    });

    /* ================== GPT ================== */
    const replyText = await askGPT({
      messages: messagesForGPT,
      plan: guild.plan
    });

    const botLines = countLines(replyText);
    const totalLines = userLines + botLines;

    /* ================== LIMIT CHECK (AFTER BOT) ================== */
    if (guild.usedDailyLines + totalLines > guild.dailyLimit) {
      return res.status(403).json({
        code: "DAILY_LIMIT",
        message: "Daily limit reached after response"
      });
    }

    if (guild.usedLines + totalLines > guild.monthlyLimit) {
      return res.status(403).json({
        code: "MONTHLY_LIMIT",
        message: "Monthly limit reached after response"
      });
    }

    /* ================== SAVE BOT MESSAGE ================== */
    await ChatMessage.create({
      guildId,
      role: "assistant",
      content: replyText,
      plan: guild.plan
    });

    /* ================== UPDATE USAGE ================== */
    guild.usedDailyLines += totalLines;
    guild.usedLines += totalLines;
    await guild.save();

    /* ================== RESPONSE ================== */
    res.json({
      reply: replyText,
      plan: guild.plan,
      image: imageUrl,
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

    const messages = await ChatMessage.find({ guildId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);

  } catch (err) {
    console.error("❌ History error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

module.exports = router;