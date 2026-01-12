require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

/* ================== MIDDLEWARES ================== */
app.use(cors({
  origin: "*", // تقدر تخصص الدومين بعدين
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ⚠️ Stripe Webhook لازم RAW BODY قبل express.json
app.use(
  "/billing/stripe/webhook",
  bodyParser.raw({ type: "application/json" })
);

// باقي الـ API JSON
app.use(express.json({ limit: "2mb" }));

/* ================== DATABASE ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ API Mongo Connected"))
  .catch(err => {
    console.error("❌ Mongo Error:", err);
    process.exit(1);
  });

/* ================== STATIC FILES ================== */
// رفع صور Vodafone Cash
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ================== ROUTES ================== */

// Public / User
app.use("/api/guild", require("./routes/guild"));
app.use("/api/auth", require("./routes/auth"));

// 🔥 CHAT (GPT / AI)
app.use("/chat", require("./routes/chat"));

// Billing System (Stripe + Vodafone)
app.use("/billing", require("./routes/billing"));

// Admin Dashboard
app.use("/admin", require("./routes/admin"));

// Staff System (OWNER / ADMIN / SUPPORT)
app.use("/staff", require("./routes/staff"));

/* ================== HEALTH CHECK ================== */
app.get("/", (_, res) => {
  res.json({
    status: "API is running 🚀",
    version: "1.0.0",
    time: new Date().toISOString()
  });
});

/* ================== 404 HANDLER ================== */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

/* ================== GLOBAL ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);

  res.status(err.status || 500).json({
    error: "Internal server error",
    message: err.message || "Unexpected error"
  });
});

/* ================== START SERVER ================== */
const PORT = process.env.API_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});