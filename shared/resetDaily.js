function shouldResetDaily(lastReset) {
  if (!lastReset) return true;

  const now = new Date();
  const last = new Date(lastReset);

  return (
    now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  );
}

module.exports = { shouldResetDaily };