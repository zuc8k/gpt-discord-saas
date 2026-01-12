const blockedWords = [
  "hack bank",
  "credit card",
  "how to scam"
];

function isBlocked(text) {
  return blockedWords.some(w =>
    text.toLowerCase().includes(w)
  );
}

module.exports = { isBlocked };