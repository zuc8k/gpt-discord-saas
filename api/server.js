require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ API Mongo Connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/guild", require("./routes/guild"));
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});