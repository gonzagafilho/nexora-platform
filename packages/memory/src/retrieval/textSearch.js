function scoreTextRecord(record, text) {
  if (!text) {
    return 0;
  }

  const normalized = String(text).toLowerCase();
  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

  const effectiveTokens = tokens.length > 0 ? tokens : [normalized];
  const title = String(record.title || "").toLowerCase();
  const content = String(record.content || "").toLowerCase();

  let score = 0;

  effectiveTokens.forEach((token) => {
    if (title.includes(token)) {
      score += 2;
    }

    if (content.includes(token)) {
      score += 1;
    }
  });

  return score;
}

function searchByText(records, text) {
  if (!text) {
    return records.map((record) => ({ ...record, _textScore: 0 }));
  }

  return records
    .map((record) => ({ ...record, _textScore: scoreTextRecord(record, text) }))
    .filter((record) => record._textScore > 0);
}

module.exports = {
  searchByText,
  scoreTextRecord
};