const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateMemoryAdapter,
  validateMemoryRecord,
  createInMemoryAdapter
} = require("../src");

test("adapter valido passa no contrato", () => {
  const adapter = createInMemoryAdapter();
  assert.equal(validateMemoryAdapter(adapter), true);
});

test("adapter invalido falha no contrato", () => {
  assert.throws(() => validateMemoryAdapter({ create: async () => ({}) }), {
    name: "MemoryError",
    code: "INVALID_ADAPTER_METHOD"
  });
});

test("memory record valido passa", () => {
  const valid = {
    id: "m-1",
    tenantId: "t-1",
    userId: "u-1",
    projectKey: "proj-a",
    appId: "app-a",
    scope: "conversation",
    type: "fact",
    title: "T",
    content: "C",
    tags: ["x"],
    importance: 1,
    source: "test",
    visibility: "internal",
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: null
  };

  assert.equal(validateMemoryRecord(valid), true);
});

test("memory record invalido sem tenantId falha", () => {
  assert.throws(
    () =>
      validateMemoryRecord({
        projectKey: "proj-a",
        appId: "app-a",
        scope: "conversation",
        type: "fact",
        content: "x"
      }),
    { name: "MemoryError", code: "MISSING_REQUIRED_FIELD" }
  );
});

test("memory record com type invalido falha", () => {
  assert.throws(
    () =>
      validateMemoryRecord({
        tenantId: "t-1",
        projectKey: "proj-a",
        appId: "app-a",
        scope: "conversation",
        type: "unknown",
        content: "x"
      }),
    { name: "MemoryError", code: "INVALID_TYPE" }
  );
});