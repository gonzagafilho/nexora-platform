const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createMemoryEngine,
  createInMemoryAdapter,
  createMemoryEventEmitter,
  MEMORY_EVENTS
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

function record(overrides = {}) {
  return {
    projectKey: "proj-a",
    appId: "app-a",
    scope: "conversation",
    type: "fact",
    title: "Evento",
    content: "conteudo de evento",
    visibility: "internal",
    ...overrides
  };
}

test("emite MemoryCreated", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });

  await engine.createMemory(record(), context());

  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_CREATED));
});

test("emite MemoryUpdated", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });
  const created = await engine.createMemory(record(), context());

  await engine.updateMemory(created.id, { title: "Atualizada" }, context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_UPDATED));
});

test("emite MemoryDeleted", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });
  const created = await engine.createMemory(record(), context());

  await engine.deleteMemory(created.id, context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_DELETED));
});

test("emite MemoryAccessed", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });
  const created = await engine.createMemory(record(), context());

  await engine.getMemory(created.id, context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_ACCESSED));
});

test("emite MemoryRemembered", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });

  await engine.remember(record(), context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_REMEMBERED));
});

test("emite MemoryForgotten", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });
  const created = await engine.remember(record(), context());

  await engine.forget(created.id, context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_FORGOTTEN));
});

test("emite MemoryContextBuilt", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });
  await engine.createMemory(record({ content: "boleto" }), context());

  await engine.buildContext({ text: "boleto" }, context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_CONTEXT_BUILT));
});

test("emite MemoryExpired quando ignora memoria expirada", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });

  await engine.createMemory(
    record({
      title: "expirada",
      expiresAt: new Date(Date.now() - 1000).toISOString()
    }),
    context()
  );

  await engine.listMemory(context());
  const names = emitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(MEMORY_EVENTS.MEMORY_EXPIRED));
});

test("registra historico e permite on off handler", async () => {
  const emitter = createMemoryEventEmitter();
  const engine = createMemoryEngine({ adapter: createInMemoryAdapter(), eventEmitter: emitter });

  let handlerCalls = 0;
  const handler = () => {
    handlerCalls += 1;
  };

  emitter.on(MEMORY_EVENTS.MEMORY_CREATED, handler);
  await engine.createMemory(record({ title: "um" }), context());
  emitter.off(MEMORY_EVENTS.MEMORY_CREATED, handler);
  await engine.createMemory(record({ title: "dois" }), context());

  assert.equal(handlerCalls, 1);
  assert.ok(emitter.getHistory().length >= 2);
  assert.ok(Array.isArray(emitter.listEvents()));
});