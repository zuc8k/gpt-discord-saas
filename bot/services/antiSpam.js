const cooldowns = new Map();

function checkSpam(userId) {
  const now = Date.now();
  const last = cooldowns.get(userId) || 0;

  if (now - last < 3000) return true; // 3 ثواني

  cooldowns.set(userId, now);
  return false;
}

module.exports = { checkSpam };