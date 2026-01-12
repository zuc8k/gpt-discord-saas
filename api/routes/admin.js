const router = require("express").Router();
const staffAuth = require("../middlewares/staffAuth");
const admin = require("../controllers/adminController");
const AuditLog = require("../models/AuditLog");

// ================== OWNER + ADMIN ==================

// جلب كل السيرفرات
router.get(
  "/guilds",
  staffAuth(["OWNER", "ADMIN"]),
  admin.getGuilds
);

// تغيير الباقة
router.post(
  "/guild/:guildId/plan",
  staffAuth(["OWNER", "ADMIN"]),
  admin.updatePlan
);

// تصفير الاستخدام (لو حابب تحتفظ بيه هنا كمان)
router.post(
  "/guild/:guildId/reset",
  staffAuth(["OWNER", "ADMIN"]),
  admin.resetUsage
);

// ================== AUDIT LOGS ==================
// OWNER + ADMIN فقط
router.get(
  "/logs",
  staffAuth(["OWNER", "ADMIN"]),
  async (req, res) => {
    try {
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(200);

      res.json(logs);
    } catch (err) {
      console.error("❌ Fetch audit logs error:", err);
      res.status(500).json({ error: "Failed to load logs" });
    }
  }
);

module.exports = router;