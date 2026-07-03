const { validateMemoryAdapter } = require("../contracts/adapterContract");
const { validateMemoryRecord } = require("../contracts/memoryContract");
const { createNoopAdapter } = require("../adapters/noopAdapter");
const { normalizeMemory } = require("./memoryNormalizer");
const { buildContextFromMemories } = require("./memoryContext");
const { applyPolicy, assertTenantContext, canAccessRecord } = require("./memoryPolicy");

function createMemoryEngine(options = {}) {
  const adapter = options.adapter || createNoopAdapter();
  validateMemoryAdapter(adapter);

  async function createMemory(record, context = {}) {
    assertTenantContext(context);
    const normalized = normalizeMemory(record, context);
    return adapter.create(normalized, context);
  }

  async function updateMemory(id, patch = {}, context = {}) {
    assertTenantContext(context);
    const current = await getMemory(id, context);
    if (!current) {
      return null;
    }

    const nextRecord = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    validateMemoryRecord(nextRecord);
    return adapter.update(id, patch, context);
  }

  async function deleteMemory(id, context = {}) {
    assertTenantContext(context);
    const current = await adapter.findById(id, context);

    if (!current || !canAccessRecord(current, context)) {
      return false;
    }

    return adapter.delete(id, context);
  }

  async function getMemory(id, context = {}) {
    assertTenantContext(context);
    const record = await adapter.findById(id, context);
    if (!record) {
      return null;
    }

    if (!canAccessRecord(record, context)) {
      return null;
    }

    return record;
  }

  async function searchMemory(query = {}, context = {}) {
    assertTenantContext(context);
    const searched = await adapter.search(query, context);
    const safeRecords = applyPolicy(searched, context);
    return buildContextFromMemories(safeRecords, query).items;
  }

  async function listMemory(context = {}) {
    assertTenantContext(context);
    const listed = await adapter.list(context);
    return applyPolicy(listed, context);
  }

  async function remember(input, context = {}) {
    return createMemory(input, context);
  }

  async function forget(id, context = {}) {
    return deleteMemory(id, context);
  }

  async function buildContext(query = {}, context = {}) {
    const memories = await searchMemory(query, context);
    return buildContextFromMemories(memories, query);
  }

  return {
    createMemory,
    updateMemory,
    deleteMemory,
    getMemory,
    searchMemory,
    listMemory,
    remember,
    forget,
    buildContext
  };
}

module.exports = {
  createMemoryEngine
};