function rankMemories(records, options = {}) {
  const now = new Date(options.now || Date.now()).getTime();

  const ranked = records.map((record) => {
    const importance = typeof record.importance === "number" ? record.importance : 0;
    const textScore = typeof record._textScore === "number" ? record._textScore : 0;
    const tagScore = typeof record._tagScore === "number" ? record._tagScore : 0;
    const updatedAt = new Date(record.updatedAt || record.createdAt || now).getTime();
    const ageInDays = Math.max(0, (now - updatedAt) / (1000 * 60 * 60 * 24));
    const recencyScore = Math.max(0, 10 - ageInDays);
    const score = importance * 3 + textScore * 2 + tagScore * 2 + recencyScore;

    return {
      ...record,
      _score: score
    };
  });

  return ranked.sort((a, b) => b._score - a._score);
}

module.exports = {
  rankMemories
};