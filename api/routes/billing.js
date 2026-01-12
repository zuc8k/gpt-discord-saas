const router = require("express").Router();
const staffAuth = require("../middlewares/staffAuth");
const Invoice = require("../models/Invoice");
const Guild = require("../models/Guild");
const plans = require("../shared/plans");
const logAction = require("../utils/audit");

// ================== CREATE INVOICE ==================
router.post("/create", async (req, res) => {
  const { guildId, plan, duration, method } = req.body;

  if (!plans[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const amount = plans[plan].price[duration];

  const invoice = await Invoice.create({
    guildId,
    plan,
    duration,
    amount,
    method
  });

  res.json(invoice);
});

// ================== CONFIRM PAYMENT (STAFF) ==================
router.post(
  "/confirm/:invoiceId",
  staffAuth(["OWNER", "ADMIN"]),
  async (req, res) => {
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    invoice.status = "PAID";
    await invoice.save();

    // Upgrade Guild
    const days = invoice.duration === "yearly" ? 365 : 30;
    const planData = plans[invoice.plan];

    await Guild.findOneAndUpdate(
      { guildId: invoice.guildId },
      {
        plan: invoice.plan,
        dailyLimit: planData.dailyLines,
        monthlyLimit: planData.monthlyLines,
        yearlyLimit: planData.yearlyLines,
        usedLines: 0,
        usedDailyLines: 0,
        expiresAt: Date.now() + days * 24 * 60 * 60 * 1000
      }
    );

    // Audit Log
    await logAction({
      staff: req.staff,
      action: "BILLING_UPGRADE",
      guildId: invoice.guildId,
      details: {
        plan: invoice.plan,
        duration: invoice.duration,
        method: invoice.method
      }
    });

    res.json({ success: true });
  }
);

module.exports = router;