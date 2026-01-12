const plans = require("./plans");

function applyPlan(guild, planName, duration = "monthly") {
  const plan = plans[planName];

  guild.plan = planName;

  if (duration === "yearly") {
    guild.yearlyLimit = plan.yearlyLines;
    guild.monthlyLimit = plan.yearlyLines;
    guild.expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
  } else {
    guild.monthlyLimit = plan.monthlyLines;
    guild.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  }

  guild.usedLines = 0;
  guild.lastReset = new Date();

  return guild;
}

module.exports = { applyPlan };