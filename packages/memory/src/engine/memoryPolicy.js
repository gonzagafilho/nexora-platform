const { MemoryError } = require("../errors/MemoryError");

function assertTenantContext(context = {}) {
  if (!context.tenantId) {
    throw new MemoryError("tenantId is required", "MISSING_TENANT_ID");
  }

  return true;
}

function isExpired(record, now = Date.now()) {
  if (!record.expiresAt) {
    return false;
  }

  return new Date(record.expiresAt).getTime() <= now;
}

function matchesProjectAndApp(record, context = {}) {
  if (context.projectKey && record.projectKey !== context.projectKey) {
    return false;
  }

  if (context.appId && record.appId !== context.appId) {
    return false;
  }

  return true;
}

function canAccessRecord(record, context = {}) {
  if (record.tenantId !== context.tenantId) {
    return false;
  }

  if (!matchesProjectAndApp(record, context)) {
    return false;
  }

  if (isExpired(record)) {
    return false;
  }

  if (record.visibility === "private") {
    return Boolean(context.userId && record.userId === context.userId);
  }

  if (record.visibility === "internal") {
    return true;
  }

  if (record.visibility === "public") {
    return true;
  }

  return false;
}

function applyPolicy(records, context = {}) {
  assertTenantContext(context);

  return records.filter((record) => canAccessRecord(record, context));
}

module.exports = {
  assertTenantContext,
  isExpired,
  matchesProjectAndApp,
  canAccessRecord,
  applyPolicy
};