function searchByTags(records, tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return records.map((record) => ({ ...record, _tagScore: 0 }));
  }

  const normalized = tags.map((tag) => String(tag).toLowerCase());

  return records
    .map((record) => {
      const recordTags = Array.isArray(record.tags) ? record.tags.map((tag) => String(tag).toLowerCase()) : [];
      const matches = normalized.filter((tag) => recordTags.includes(tag)).length;
      return {
        ...record,
        _tagScore: matches
      };
    })
    .filter((record) => record._tagScore > 0);
}

module.exports = {
  searchByTags
};