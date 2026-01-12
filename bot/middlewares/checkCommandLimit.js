const commandLimits = require("../../shared/commandLimits");
const Guild = require("../../api/models/Guild");
const { shouldResetDaily } = require("../../shared/resetDaily");

module.exports = async function checkCommandLimit(interaction) {
  const commandName = interaction.commandName;
  const limits = commandLimits[commandName];

  if (!limits) return { allowed: true };

  const guild = await Guild.findOne({ guildId: interaction.guild.id });
  if (!guild) return { allowed: false };

  const plan = guild.plan || "FREE";

  // ================== DAILY RESET ==================
  if (shouldResetDaily(guild.lastDailyReset)) {
    guild.dailyCommandUsage = {};
    guild.lastDailyReset = new Date();
  }

  const dailyUsed = guild.dailyCommandUsage?.get(commandName) || 0;
  const monthlyUsed = guild.commandUsage?.get(commandName) || 0;

  const dailyLimit = limits.daily?.[plan];
  const monthlyLimit = limits.monthly?.[plan];

  // ================== DAILY CHECK ==================
  if (dailyLimit !== undefined && dailyLimit !== Infinity) {
    if (dailyUsed >= dailyLimit) {
      return {
        allowed: false,
        message: `⚠️ وصلت للحد اليومي لأمر **/${commandName}**`
      };
    }
  }

  // ================== MONTHLY CHECK ==================
  if (monthlyLimit !== undefined && monthlyLimit !== Infinity) {
    if (monthlyUsed >= monthlyLimit) {
      return {
        allowed: false,
        message: `⚠️ وصلت للحد الشهري لأمر **/${commandName}**`
      };
    }
  }

  // ================== UPDATE COUNTERS ==================
  guild.dailyCommandUsage.set(commandName, dailyUsed + 1);
  guild.commandUsage.set(commandName, monthlyUsed + 1);
  await guild.save();

  return { allowed: true };
};