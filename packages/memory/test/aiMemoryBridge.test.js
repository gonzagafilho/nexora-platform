const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createAIMemoryBridge,
  createMemoryEngine,
  createInMemoryAdapter
} = require("../src");

function context(overrides = {}) {
  return {
    tenantId: "tenant-1",
    userId: "user-1",
    projectKey: "proj-a",
    appId: "app-a",
    ...overrides
  };
}

test("AI bridge salva e resolve memoria", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  const bridge = createAIMemoryBridge({ memoryEngine: engine });

  await bridge.saveMemory(
    {
      scope: "conversation",
      type: "fact",
      title: "Canal preferido",
      content: "cliente prefere email",
      visibility: "private",
      projectKey: "proj-a",
      appId: "app-a"
    },
    context()
  );

  const found = await bridge.resolveMemory({ text: "email" }, context());
  assert.equal(found.length, 1);
  assert.equal(found[0].title, "Canal preferido");
});

test("AI bridge resolveContext retorna janela de memoria", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  const bridge = createAIMemoryBridge({ memoryEngine: engine });

  await bridge.saveMemory(
    {
      scope: "conversation",
      type: "fact",
      title: "Assunto financeiro",
      content: "boleto e vencimento",
      visibility: "internal",
      projectKey: "proj-a",
      appId: "app-a"
    },
    context()
  );

  const resolved = await bridge.resolveContext({
    message: "me fale sobre boleto",
    tenantId: "tenant-1",
    userId: "user-1",
    projectKey: "proj-a",
    appId: "app-a",
    maxItems: 3
  });

  assert.equal(Array.isArray(resolved.items), true);
  assert.equal(resolved.items.length, 1);
});

test("AI bridge respeita isolamento de tenant", async () => {
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter() });
  const bridge = createAIMemoryBridge({ memoryEngine: engine });

  await bridge.saveMemory(
    {
      scope: "conversation",
      type: "fact",
      title: "Tenant A",
      content: "conteudo A",
      visibility: "internal",
      projectKey: "proj-a",
      appId: "app-a"
    },
    context({ tenantId: "tenant-A" })
  );

  const result = await bridge.resolveMemory(
    { text: "conteudo" },
    context({ tenantId: "tenant-B" })
  );

  assert.equal(result.length, 0);
});