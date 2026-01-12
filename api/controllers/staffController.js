const Staff = require("../models/Staff");
const crypto = require("crypto");

// ================== CREATE STAFF ==================
exports.createStaff = async (req, res) => {
  const { username, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({ error: "Missing data" });
  }

  const token = crypto.randomBytes(24).toString("hex");

  const staff = await Staff.create({
    username,
    role,
    token
  });

  res.json({
    success: true,
    staff: {
      username: staff.username,
      role: staff.role,
      token: staff.token
    }
  });
};

// ================== LIST STAFF ==================
exports.listStaff = async (_, res) => {
  const staff = await Staff.find().select("-_id username role createdAt");
  res.json(staff);
};

// ================== DELETE STAFF ==================
exports.deleteStaff = async (req, res) => {
  await Staff.deleteOne({ username: req.params.username });
  res.json({ success: true });
};