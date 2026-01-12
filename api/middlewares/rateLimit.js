const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 60, // 60 request
  message: { error: "Too many requests" }
});

module.exports = apiLimiter;