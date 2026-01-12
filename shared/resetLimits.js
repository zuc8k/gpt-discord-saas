function shouldReset(lastReset) {
  if (!lastReset) return true;

  const now = new Date();
  const diff = now - new Date(lastReset);

  return diff >= 30 * 24 * 60 * 60 * 1000;
}

module.exports = { shouldReset };