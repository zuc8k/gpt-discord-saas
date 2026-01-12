require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================== MIDDLEWARES ==================
app.use(cors());
app.use(express.json());

// ================== DATABASE ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ API Mongo Connected"))
  .catch(err => {
    console.error("❌ Mongo Error:", err);
    process.exit(1);
  });

// ================== ROUTES ==================

// Public / User
app.use("/api/guild", require("./routes/guild"));
app.use("/api/auth", require("./routes/auth"));

// Admin Dashboard
app.use("/admin", require("./routes/admin"));

// Staff System (OWNER / ADMIN / SUPPORT)
app.use("/staff", require("./routes/staff"));

// ================== HEALTH CHECK ==================
app.get("/", (_, res) => {
  res.json({ status: "API is running 🚀" });
});

// ================== START SERVER ==================
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});