function buildMemoryContext(records, options = {}) {
  const maxItems = options.maxItems || 8;
  const maxChars = options.maxChars || 1800;

  const items = [];
  let usedChars = 0;

  for (const record of records) {
    if (items.length >= maxItems) {
      break;
    }

    const snippet = `${record.title || ""} ${record.content || ""}`.trim();
    const nextChars = usedChars + snippet.length;

    if (nextChars > maxChars) {
      break;
    }

    items.push(record);
    usedChars = nextChars;
  }

  return {
    items,
    totalItems: items.length,
    usedChars,
    truncated: items.length < records.length
  };
}

module.exports = {
  buildMemoryContext
};