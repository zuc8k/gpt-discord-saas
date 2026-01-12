const router = require("express").Router();
const Guild = require("../models/Guild");
const plans = require("../../shared/plans");

router.post("/stripe", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const data = event.data.object.metadata;

    const guild = await Guild.findOne({ guildId: data.guildId });
    if (!guild) return res.sendStatus(404);

    const plan = plans[data.plan];

    guild.plan = data.plan;
    guild.usedLines = 0;
    guild.lastReset = new Date();

    if (data.duration === "yearly") {
      guild.monthlyLimit = plan.yearlyLines;
      guild.expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    } else {
      guild.monthlyLimit = plan.monthlyLines;
      guild.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    }

    await guild.save();
  }

  res.json({ received: true });
});

module.exports = router;