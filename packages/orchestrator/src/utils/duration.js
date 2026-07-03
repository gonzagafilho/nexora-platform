function calculateDuration(startedAt, finishedAt = Date.now()) {
  return Math.max(0, finishedAt - startedAt);
}

module.exports = {
  calculateDuration
};