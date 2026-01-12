module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};