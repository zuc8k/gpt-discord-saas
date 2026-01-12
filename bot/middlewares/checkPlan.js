const planRanks = require("../../shared/planRanks");
const Guild = require("../../api/models/Guild");

module.exports = async function checkPlan(interaction, requiredPlan) {
  if (!requiredPlan) return true;

  const guild = await Guild.findOne({ guildId: interaction.guild.id });
  if (!guild) return false;

  const userPlanRank = planRanks[guild.plan] ?? 0;
  const requiredPlanRank = planRanks[requiredPlan];

  return userPlanRank >= requiredPlanRank;
};