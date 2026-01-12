const router = require("express").Router();
const adminAuth = require("../middlewares/adminAuth");
const admin = require("../controllers/adminController");

router.use(adminAuth);

router.get("/guilds", admin.getGuilds);
router.post("/guild/:guildId/plan", admin.updatePlan);
router.post("/guild/:guildId/reset", admin.resetUsage);

module.exports = router;