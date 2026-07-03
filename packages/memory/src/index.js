const { createMemoryEngine } = require("./engine/memoryEngine");
const { createInMemoryAdapter } = require("./adapters/inMemoryAdapter");
const { createNoopAdapter } = require("./adapters/noopAdapter");
const { createAIMemoryBridge } = require("./bridge/aiMemoryBridge");
const { normalizeMemory } = require("./engine/memoryNormalizer");
const { rankMemories } = require("./retrieval/relevanceRanker");
const { searchByText } = require("./retrieval/textSearch");
const { searchByTags } = require("./retrieval/tagSearch");
const { buildMemoryContext } = require("./retrieval/contextWindow");
const { MEMORY_VERSION } = require("./version");
const { MemoryError } = require("./errors/MemoryError");
const { validateMemoryAdapter } = require("./contracts/adapterContract");
const { validateMemoryRecord } = require("./contracts/memoryContract");

module.exports = {
  createMemoryEngine,
  createInMemoryAdapter,
  createNoopAdapter,
  createAIMemoryBridge,
  normalizeMemory,
  rankMemories,
  searchByText,
  searchByTags,
  buildMemoryContext,
  MEMORY_VERSION,
  MemoryError,
  validateMemoryAdapter,
  validateMemoryRecord
};
