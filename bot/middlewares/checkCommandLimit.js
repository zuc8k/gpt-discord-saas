const commandLimits = require("../../shared/commandLimits");
const Guild = require("../../api/models/Guild");

module.exports = async function checkCommandLimit(interaction) {
  const commandName = interaction.commandName;
  const limits = commandLimits[commandName];

  // لو الأمر ملوش Limit
  if (!limits) return { allowed: true };

  const guild = await Guild.findOne({ guildId: interaction.guild.id });
  if (!guild) return { allowed: false };

  const plan = guild.plan || "FREE";
  const maxUsage = limits[plan];

  if (maxUsage === Infinity) return { allowed: true };

  const used = guild.commandUsage?.get(commandName) || 0;

  if (used >= maxUsage) {
    return {
      allowed: false,
      message: `⚠️ وصلت للحد الأقصى لاستخدام أمر **/${commandName}** في باقة ${plan}`
    };
  }

  // زيادة العداد
  guild.commandUsage.set(commandName, used + 1);
  await guild.save();

  return { allowed: true };
};