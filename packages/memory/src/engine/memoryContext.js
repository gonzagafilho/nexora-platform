const { searchByText } = require("../retrieval/textSearch");
const { searchByTags } = require("../retrieval/tagSearch");
const { rankMemories } = require("../retrieval/relevanceRanker");
const { buildMemoryContext } = require("../retrieval/contextWindow");

function buildContextFromMemories(records, query = {}) {
  let working = [...records];

  if (query.text) {
    working = searchByText(working, query.text);
  }

  if (Array.isArray(query.tags) && query.tags.length > 0) {
    const tagged = searchByTags(working, query.tags);
    working = tagged;
  }

  if (query.scope) {
    working = working.filter((record) => record.scope === query.scope);
  }

  if (query.type) {
    working = working.filter((record) => record.type === query.type);
  }

  const ranked = rankMemories(working, { now: query.now });
  return buildMemoryContext(ranked, {
    maxItems: query.maxItems,
    maxChars: query.maxChars
  });
}

module.exports = {
  buildContextFromMemories
};