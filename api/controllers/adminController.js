const Guild = require("../models/Guild");
const plans = require("../../shared/plans");

// ================== GET ALL GUILDS ==================
exports.getGuilds = async (_, res) => {
  const guilds = await Guild.find().sort({ createdAt: -1 });
  res.json(guilds);
};

// ================== UPDATE PLAN ==================
exports.updatePlan = async (req, res) => {
  const { guildId } = req.params;
  const { plan, duration } = req.body;

  const planData = plans[plan];
  if (!planData) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const guild = await Guild.findOne({ guildId });
  if (!guild) {
    return res.status(404).json({ error: "Guild not found" });
  }

  guild.plan = plan;
  guild.dailyLimit = planData.dailyLines;
  guild.monthlyLimit = planData.monthlyLines;
  guild.usedDailyLines = 0;
  guild.usedLines = 0;
  guild.commandUsage = {};
  guild.dailyCommandUsage = {};
  guild.lastReset = new Date();
  guild.lastDailyReset = new Date();

  guild.expiresAt =
    duration === "yearly"
      ? Date.now() + 365 * 24 * 60 * 60 * 1000
      : Date.now() + 30 * 24 * 60 * 60 * 1000;

  await guild.save();

  res.json({ success: true, guild });
};

// ================== RESET USAGE ==================
exports.resetUsage = async (req, res) => {
  const { guildId } = req.params;

  await Guild.findOneAndUpdate(
    { guildId },
    {
      usedLines: 0,
      usedDailyLines: 0,
      commandUsage: {},
      dailyCommandUsage: {},
      lastReset: new Date(),
      lastDailyReset: new Date()
    }
  );

  res.json({ success: true });
};