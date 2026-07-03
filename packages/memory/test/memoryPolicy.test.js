const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertTenantContext,
  isExpired,
  canAccessRecord,
  applyPolicy
} = require("../src/engine/memoryPolicy");

const base = {
  id: "m1",
  tenantId: "t-1",
  userId: "u-1",
  projectKey: "proj-a",
  appId: "app-a",
  visibility: "internal",
  expiresAt: null
};

test("policy bloqueia sem tenantId", () => {
  assert.throws(() => assertTenantContext({}), {
    name: "MemoryError",
    code: "MISSING_TENANT_ID"
  });
});

test("isExpired detecta expiracao", () => {
  const expired = isExpired({ expiresAt: new Date(Date.now() - 1000).toISOString() });
  assert.equal(expired, true);
});

test("isExpired false quando sem expiresAt", () => {
  assert.equal(isExpired({ expiresAt: null }), false);
});

test("canAccessRecord bloqueia cross tenant", () => {
  const allowed = canAccessRecord(base, { tenantId: "t-2", projectKey: "proj-a", appId: "app-a" });
  assert.equal(allowed, false);
});

test("canAccessRecord respeita project e app", () => {
  const allowed = canAccessRecord(base, { tenantId: "t-1", projectKey: "proj-b", appId: "app-a" });
  assert.equal(allowed, false);
});

test("canAccessRecord private exige userId igual", () => {
  const privateRecord = { ...base, visibility: "private" };
  assert.equal(canAccessRecord(privateRecord, { tenantId: "t-1", userId: "u-2", projectKey: "proj-a", appId: "app-a" }), false);
  assert.equal(canAccessRecord(privateRecord, { tenantId: "t-1", userId: "u-1", projectKey: "proj-a", appId: "app-a" }), true);
});

test("applyPolicy filtra por regras", () => {
  const records = [
    { ...base, id: "a", visibility: "internal" },
    { ...base, id: "b", visibility: "private", userId: "u-2" }
  ];

  const filtered = applyPolicy(records, {
    tenantId: "t-1",
    userId: "u-1",
    projectKey: "proj-a",
    appId: "app-a"
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "a");
});