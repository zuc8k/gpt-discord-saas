const plans = require("./plans");

module.exports = function applyPlan(guild, planName, duration = "monthly") {
  const plan = plans[planName];
  if (!plan) throw new Error("Invalid plan");

  guild.plan = planName;
  guild.usedLines = 0;
  guild.lastReset = new Date();

  if (duration === "yearly") {
    guild.monthlyLimit = plan.yearlyLines;
    guild.expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
  } else {
    guild.monthlyLimit = plan.monthlyLines;
    guild.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  }

  return guild;
};