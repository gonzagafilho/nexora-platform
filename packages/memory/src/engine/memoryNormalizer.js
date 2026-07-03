const { validateMemoryRecord } = require("../contracts/memoryContract");

function createId() {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMemory(record, context = {}) {
  const now = new Date().toISOString();
  const normalized = {
    id: record.id || createId(),
    tenantId: record.tenantId || context.tenantId,
    userId: record.userId || context.userId || null,
    projectKey: record.projectKey || context.projectKey,
    appId: record.appId || context.appId,
    scope: record.scope || "conversation",
    type: record.type || "fact",
    title: record.title || "",
    content: record.content || "",
    tags: Array.isArray(record.tags) ? record.tags : [],
    importance: typeof record.importance === "number" ? record.importance : 0,
    source: record.source || "memory-engine",
    visibility: record.visibility || "internal",
    metadata: record.metadata && typeof record.metadata === "object" ? record.metadata : {},
    createdAt: record.createdAt || now,
    updatedAt: now,
    expiresAt: record.expiresAt || null
  };

  validateMemoryRecord(normalized);
  return normalized;
}

module.exports = {
  normalizeMemory
};