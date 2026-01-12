function countLines(text) {
  const charsPerLine = 90;
  return Math.ceil(text.length / charsPerLine);
}

module.exports = { countLines };