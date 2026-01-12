const Staff = require("../models/Staff");

module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const staff = await Staff.findOne({ token });
    if (!staff) {
      return res.status(403).json({ error: "Invalid staff token" });
    }

    if (!allowedRoles.includes(staff.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    req.staff = staff;
    next();
  };
};