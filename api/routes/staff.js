const router = require("express").Router();
const staffAuth = require("../middlewares/staffAuth");
const staff = require("../controllers/staffController");
const Guild = require("../models/Guild");
const logAction = require("../utils/audit");

// ================== STAFF INFO (WHO AM I) ==================
// OWNER / ADMIN / SUPPORT
router.get(
  "/me",
  staffAuth(["OWNER", "ADMIN", "SUPPORT"]),
  (req, res) => {
    res.json({
      username: req.staff.username,
      role: req.staff.role
    });
  }
);

// ================== OWNER ONLY ==================
router.post(
  "/create",
  staffAuth(["OWNER"]),
  async (req, res) => {
    const result = await staff.createStaff(req, res);

    // Audit Log (لو الإنشاء تم)
    if (result?.staff) {
      await logAction({
        staff: req.staff,
        action: "CREATE_STAFF",
        details: {
          username: result.staff.username,
          role: result.staff.role
        }
      });
    }
  }
);

router.get(
  "/list",
  staffAuth(["OWNER"]),
  staff.listStaff
);

router.delete(
  "/delete/:username",
  staffAuth(["OWNER"]),
  async (req, res) => {
    const username = req.params.username;

    await staff.deleteStaff(req, res);

    // Audit Log
    await logAction({
      staff: req.staff,
      action: "DELETE_STAFF",
      details: { username }
    });
  }
);

// ================== ADMIN + OWNER ==================
router.get(
  "/dashboard",
  staffAuth(["OWNER", "ADMIN"]),
  (req, res) => {
    res.json({
      message: "Admin Dashboard Access",
      role: req.staff.role
    });
  }
);

// ================== SUPPORT + ADMIN + OWNER ==================
router.post(
  "/reset/:guildId",
  staffAuth(["OWNER", "ADMIN", "SUPPORT"]),
  async (req, res) => {
    try {
      const guild = await Guild.findOneAndUpdate(
        { guildId: req.params.guildId },
        {
          usedLines: 0,
          usedDailyLines: 0,
          commandUsage: {},
          dailyCommandUsage: {},
          lastReset: new Date(),
          lastDailyReset: new Date()
        },
        { new: true }
      );

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Audit Log
      await logAction({
        staff: req.staff,
        action: "RESET_USAGE",
        guildId: guild.guildId
      });

      res.json({
        success: true,
        guildId: guild.guildId
      });

    } catch (err) {
      console.error("❌ Staff reset error:", err);
      res.status(500).json({ error: "Reset failed" });
    }
  }
);

module.exports = router;