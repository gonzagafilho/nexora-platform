const { validateMemoryAdapter } = require("../contracts/adapterContract");
const { validateMemoryRecord } = require("../contracts/memoryContract");
const { createNoopAdapter } = require("../adapters/noopAdapter");
const { createMemoryEventEmitter } = require("../events/memoryEventEmitter");
const { MEMORY_EVENTS } = require("../events/memoryEvents");
const { normalizeMemory } = require("./memoryNormalizer");
const { buildContextFromMemories } = require("./memoryContext");
const {
  applyPolicy,
  assertTenantContext,
  canAccessRecord,
  isExpired,
  matchesProjectAndApp
} = require("./memoryPolicy");

function createMemoryEngine(options = {}) {
  const adapter = options.adapter || createNoopAdapter();
  const eventEmitter = options.eventEmitter || createMemoryEventEmitter();
  validateMemoryAdapter(adapter);

  function emit(eventName, payload) {
    eventEmitter.emit(eventName, payload);
  }

  function emitExpiredFromCollection(records, context) {
    records.forEach((record) => {
      if (
        record.tenantId === context.tenantId &&
        matchesProjectAndApp(record, context) &&
        isExpired(record)
      ) {
        emit(MEMORY_EVENTS.MEMORY_EXPIRED, {
          id: record.id,
          tenantId: record.tenantId,
          projectKey: record.projectKey,
          appId: record.appId,
          expiresAt: record.expiresAt
        });
      }
    });
  }

  async function createMemory(record, context = {}) {
    assertTenantContext(context);
    const normalized = normalizeMemory(record, context);
    const created = await adapter.create(normalized, context);
    emit(MEMORY_EVENTS.MEMORY_CREATED, {
      id: created.id,
      tenantId: created.tenantId,
      projectKey: created.projectKey,
      appId: created.appId,
      scope: created.scope,
      type: created.type
    });
    return created;
  }

  async function updateMemory(id, patch = {}, context = {}) {
    assertTenantContext(context);
    const current = await getMemory(id, context, { emitAccess: false });
    if (!current) {
      return null;
    }

    const nextRecord = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    validateMemoryRecord(nextRecord);
    const updated = await adapter.update(id, patch, context);
    if (updated) {
      emit(MEMORY_EVENTS.MEMORY_UPDATED, {
        id: updated.id,
        tenantId: updated.tenantId,
        projectKey: updated.projectKey,
        appId: updated.appId
      });
    }
    return updated;
  }

  async function deleteMemory(id, context = {}) {
    assertTenantContext(context);
    const current = await getMemory(id, context, { emitAccess: false });

    if (!current || !canAccessRecord(current, context)) {
      return false;
    }

    const deleted = await adapter.delete(id, context);
    if (deleted) {
      emit(MEMORY_EVENTS.MEMORY_DELETED, {
        id,
        tenantId: context.tenantId,
        projectKey: context.projectKey,
        appId: context.appId
      });
    }
    return deleted;
  }

  async function getMemory(id, context = {}, behavior = {}) {
    assertTenantContext(context);
    const emitAccess = behavior.emitAccess !== false;
    const record = await adapter.findById(id, context);
    if (!record) {
      return null;
    }

    if (record.tenantId === context.tenantId && matchesProjectAndApp(record, context) && isExpired(record)) {
      emit(MEMORY_EVENTS.MEMORY_EXPIRED, {
        id: record.id,
        tenantId: record.tenantId,
        projectKey: record.projectKey,
        appId: record.appId,
        expiresAt: record.expiresAt
      });
    }

    if (!canAccessRecord(record, context)) {
      return null;
    }

    if (emitAccess) {
      emit(MEMORY_EVENTS.MEMORY_ACCESSED, {
        id: record.id,
        tenantId: record.tenantId,
        projectKey: record.projectKey,
        appId: record.appId
      });
    }

    return record;
  }

  async function searchMemory(query = {}, context = {}) {
    assertTenantContext(context);
    const searched = await adapter.search(query, context);
    emitExpiredFromCollection(searched, context);
    const safeRecords = applyPolicy(searched, context);
    return buildContextFromMemories(safeRecords, query).items;
  }

  async function listMemory(context = {}) {
    assertTenantContext(context);
    const listed = await adapter.list(context);
    emitExpiredFromCollection(listed, context);
    return applyPolicy(listed, context);
  }

  async function remember(input, context = {}) {
    const created = await createMemory(input, context);
    emit(MEMORY_EVENTS.MEMORY_REMEMBERED, {
      id: created.id,
      tenantId: created.tenantId,
      projectKey: created.projectKey,
      appId: created.appId
    });
    return created;
  }

  async function forget(id, context = {}) {
    const deleted = await deleteMemory(id, context);
    if (deleted) {
      emit(MEMORY_EVENTS.MEMORY_FORGOTTEN, {
        id,
        tenantId: context.tenantId,
        projectKey: context.projectKey,
        appId: context.appId
      });
    }
    return deleted;
  }

  async function buildContext(query = {}, context = {}) {
    const memories = await searchMemory(query, context);
    const window = buildContextFromMemories(memories, query);
    emit(MEMORY_EVENTS.MEMORY_CONTEXT_BUILT, {
      tenantId: context.tenantId,
      projectKey: context.projectKey,
      appId: context.appId,
      totalItems: window.totalItems
    });
    return window;
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
    buildContext,
    eventEmitter
  };
}

module.exports = {
  createMemoryEngine
};