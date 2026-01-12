const router = require("express").Router();
const staffAuth = require("../middlewares/staffAuth");
const staff = require("../controllers/staffController");

// OWNER فقط
router.post("/create", staffAuth(["OWNER"]), staff.createStaff);
router.get("/list", staffAuth(["OWNER"]), staff.listStaff);
router.delete("/delete/:username", staffAuth(["OWNER"]), staff.deleteStaff);

// ADMIN + OWNER
router.get("/dashboard", staffAuth(["OWNER", "ADMIN"]), (req, res) => {
  res.json({
    message: "Admin Dashboard Access",
    role: req.staff.role
  });
});

// SUPPORT + ADMIN + OWNER
router.post("/reset/:guildId", staffAuth(["OWNER", "ADMIN", "SUPPORT"]), async (req, res) => {
  const Guild = require("../models/Guild");

  await Guild.findOneAndUpdate(
    { guildId: req.params.guildId },
    {
      usedLines: 0,
      usedDailyLines: 0
    }
  );

  res.json({ success: true });
});

module.exports = router;