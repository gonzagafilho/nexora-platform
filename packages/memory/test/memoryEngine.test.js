const test = require("node:test");
const assert = require("node:assert/strict");

const { createMemoryEngine, createInMemoryAdapter, createNoopAdapter } = require("../src");

function baseContext(overrides = {}) {
  return {
    tenantId: "tenant-1",
    userId: "user-1",
    projectKey: "proj-a",
    appId: "app-a",
    ...overrides
  };
}

function baseRecord(overrides = {}) {
  return {
    projectKey: "proj-a",
    appId: "app-a",
    scope: "conversation",
    type: "fact",
    title: "Default",
    content: "conteudo padrao",
    visibility: "internal",
    ...overrides
  };
}

test("criar e listar memoria", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  await engine.createMemory(baseRecord({ title: "A" }), baseContext());
  await engine.createMemory(baseRecord({ title: "B" }), baseContext());

  const items = await engine.listMemory(baseContext());
  assert.equal(items.length, 2);
});

test("buscar por texto retorna memoria esperada", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  await engine.createMemory(baseRecord({ title: "Pagamento", content: "Boleto recorrente" }), baseContext());
  await engine.createMemory(baseRecord({ title: "Outro", content: "Sem match" }), baseContext());

  const items = await engine.searchMemory({ text: "boleto" }, baseContext());
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Pagamento");
});

test("buscar por tags retorna memoria esperada", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  await engine.createMemory(baseRecord({ title: "VIP", tags: ["vip", "finance"] }), baseContext());
  await engine.createMemory(baseRecord({ title: "Comum", tags: ["default"] }), baseContext());

  const items = await engine.searchMemory({ tags: ["vip"] }, baseContext());
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "VIP");
});

test("isolamento por tenant", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  await engine.createMemory(baseRecord({ title: "Tenant 1" }), baseContext({ tenantId: "tenant-1" }));
  await engine.createMemory(baseRecord({ title: "Tenant 2" }), baseContext({ tenantId: "tenant-2" }));

  const tenant1 = await engine.listMemory(baseContext({ tenantId: "tenant-1" }));
  const tenant2 = await engine.listMemory(baseContext({ tenantId: "tenant-2" }));

  assert.equal(tenant1.length, 1);
  assert.equal(tenant2.length, 1);
  assert.notEqual(tenant1[0].tenantId, tenant2[0].tenantId);
});

test("isolamento por projectKey e appId", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  await engine.createMemory(baseRecord({ title: "A1", projectKey: "proj-a", appId: "app-a" }), baseContext());
  await engine.createMemory(baseRecord({ title: "B1", projectKey: "proj-b", appId: "app-b" }), baseContext());

  const filtered = await engine.listMemory(baseContext({ projectKey: "proj-a", appId: "app-a" }));
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, "A1");
});

test("memoria expirada nao aparece", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  await engine.createMemory(
    baseRecord({
      title: "Expirada",
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString()
    }),
    baseContext()
  );

  const items = await engine.listMemory(baseContext());
  assert.equal(items.length, 0);
});

test("visibility private exige userId igual", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  const created = await engine.createMemory(
    baseRecord({ title: "Privada", visibility: "private" }),
    baseContext({ userId: "owner" })
  );

  const denied = await engine.getMemory(created.id, baseContext({ userId: "other" }));
  const allowed = await engine.getMemory(created.id, baseContext({ userId: "owner" }));

  assert.equal(denied, null);
  assert.ok(allowed);
});

test("remember e forget funcionam", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  const created = await engine.remember(baseRecord({ title: "Temp" }), baseContext());

  const deleted = await engine.forget(created.id, baseContext());
  const fetched = await engine.getMemory(created.id, baseContext());

  assert.equal(deleted, true);
  assert.equal(fetched, null);
});

test("buildContext aplica limite de itens", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });

  for (let i = 0; i < 5; i += 1) {
    await engine.createMemory(baseRecord({ title: `Item ${i}`, content: "texto" }), baseContext());
  }

  const contextWindow = await engine.buildContext({ text: "texto", maxItems: 3 }, baseContext());
  assert.equal(contextWindow.items.length, 3);
});

test("noop adapter retorna vazio sem erro", async () => {
  const engine = createMemoryEngine({ adapter: createNoopAdapter() });
  const listed = await engine.listMemory(baseContext());
  const searched = await engine.searchMemory({ text: "x" }, baseContext());
  assert.deepEqual(listed, []);
  assert.deepEqual(searched, []);
});