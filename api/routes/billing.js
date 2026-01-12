const router = require("express").Router();
const staffAuth = require("../middlewares/staffAuth");
const upload = require("../middlewares/upload");

const Invoice = require("../models/Invoice");
const Guild = require("../models/Guild");
const plans = require("../shared/plans");
const logAction = require("../utils/audit");

// ================== HELPERS ==================
async function upgradeGuild(invoice) {
  const days = invoice.duration === "yearly" ? 365 : 30;
  const planData = plans[invoice.plan];

  return Guild.findOneAndUpdate(
    { guildId: invoice.guildId },
    {
      plan: invoice.plan,
      dailyLimit: planData.dailyLines,
      monthlyLimit: planData.monthlyLines,
      yearlyLimit: planData.yearlyLines,
      usedLines: 0,
      usedDailyLines: 0,
      expiresAt: Date.now() + days * 24 * 60 * 60 * 1000
    },
    { new: true }
  );
}

// ================== CREATE INVOICE ==================
// method: STRIPE | VODAFONE
router.post("/create", async (req, res) => {
  try {
    const { guildId, plan, duration, method } = req.body;

    if (!guildId || !plan || !duration || !method) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!plans[plan] || !plans[plan].price?.[duration]) {
      return res.status(400).json({ error: "Invalid plan or duration" });
    }

    if (!["STRIPE", "VODAFONE"].includes(method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const amount = plans[plan].price[duration];

    const invoice = await Invoice.create({
      guildId,
      plan,
      duration,
      amount,
      currency: method === "VODAFONE" ? "EGP" : "USD",
      method,
      status: "PENDING"
    });

    res.json(invoice);

  } catch (err) {
    console.error("❌ Create invoice error:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// ================== UPLOAD VODAFONE PROOF ==================
router.post(
  "/vodafone/upload/:invoiceId",
  upload.single("proof"),
  async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (invoice.method !== "VODAFONE") {
        return res.status(400).json({ error: "Invalid invoice method" });
      }

      invoice.proofImage = `/uploads/payments/${req.file.filename}`;
      await invoice.save();

      res.json({ success: true });

    } catch (err) {
      console.error("❌ Upload proof error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ================== CONFIRM PAYMENT (STAFF) ==================
router.post(
  "/confirm/:invoiceId",
  staffAuth(["OWNER", "ADMIN"]),
  async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (invoice.status === "PAID") {
        return res.status(400).json({ error: "Invoice already paid" });
      }

      invoice.status = "PAID";
      await invoice.save();

      await upgradeGuild(invoice);

      await logAction({
        staff: req.staff,
        action: "BILLING_CONFIRM",
        guildId: invoice.guildId,
        details: {
          invoiceId: invoice._id,
          plan: invoice.plan,
          duration: invoice.duration,
          method: invoice.method
        }
      });

      res.json({ success: true });

    } catch (err) {
      console.error("❌ Confirm payment error:", err);
      res.status(500).json({ error: "Confirm failed" });
    }
  }
);

// ================== REJECT PAYMENT (STAFF) ==================
router.post(
  "/reject/:invoiceId",
  staffAuth(["OWNER", "ADMIN"]),
  async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      invoice.status = "REJECTED";
      await invoice.save();

      await logAction({
        staff: req.staff,
        action: "BILLING_REJECT",
        details: { invoiceId: invoice._id }
      });

      res.json({ success: true });

    } catch (err) {
      console.error("❌ Reject payment error:", err);
      res.status(500).json({ error: "Reject failed" });
    }
  }
);

module.exports = router;