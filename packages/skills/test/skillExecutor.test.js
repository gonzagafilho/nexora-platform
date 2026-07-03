const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createSkillRegistry,
  createToolExecutor,
  createSkillExecutor,
  createInMemorySkillAdapter,
  createNoopSkillAdapter,
  SKILL_EVENTS
} = require("../src");

function createContext(overrides = {}) {
  return {
    tenantId: "tenant-1",
    userId: "user-1",
    role: "admin",
    permissions: ["finance:read", "finance:write", "notification:send"],
    enabledModules: ["finance", "associate", "notification", "protocol", "project", "workflow", "report"],
    confirmedSkills: ["finance.createbolepix"],
    ...overrides
  };
}

function registerSkill(registry, overrides = {}) {
  return registry.register({
    name: "finance.getinvoice",
    description: "get invoice",
    version: "1.0.0",
    category: "finance",
    permissions: ["finance:read"],
    confirmationRequired: false,
    enabled: true,
    inputSchema: {},
    outputSchema: {},
    execute: async () => ({ invoiceId: "inv-1" }),
    ...overrides
  });
}

test("execucao bem-sucedida", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry);
  const executor = createSkillExecutor({ registry });

  const result = await executor.execute("finance.getinvoice", { invoiceId: "inv-1" }, createContext());
  assert.equal(result.ok, true);
  assert.equal(result.skill, "finance.getinvoice");
});

test("execucao com erro", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, {
    name: "finance.fail",
    execute: async () => {
      throw new Error("failed");
    }
  });
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("finance.fail", {}, createContext());

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "SKILL_EXECUTION_FAILED");
});

test("skill inexistente", async () => {
  const executor = createSkillExecutor({ registry: createSkillRegistry() });
  const result = await executor.execute("unknown.skill", {}, createContext());
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "SKILL_NOT_FOUND");
});

test("permission denied", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, { permissions: ["finance:admin"] });
  const executor = createSkillExecutor({ registry });

  const result = await executor.execute("finance.getinvoice", {}, createContext({ permissions: ["finance:read"] }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "PERMISSION_DENIED");
});

test("confirmationRequired", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, {
    name: "finance.createbolepix",
    permissions: ["finance:write"],
    confirmationRequired: true
  });
  const executor = createSkillExecutor({ registry });

  const denied = await executor.execute(
    "finance.createbolepix",
    { amount: 10 },
    createContext({ confirmedSkills: [] })
  );

  const allowed = await executor.execute(
    "finance.createbolepix",
    { amount: 10 },
    createContext({ confirmedSkills: ["finance.createbolepix"] })
  );

  assert.equal(denied.ok, false);
  assert.equal(denied.error.code, "CONFIRMATION_REQUIRED");
  assert.equal(allowed.ok, true);
});

test("skill disabled", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, { enabled: false });
  const executor = createSkillExecutor({ registry });

  const result = await executor.execute("finance.getinvoice", {}, createContext());
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "SKILL_DISABLED");
});

test("adapter in-memory executa quando disponivel", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, { name: "notification.email", category: "notification", permissions: ["notification:send"] });

  const adapter = createInMemorySkillAdapter({
    "notification.email": async () => ({ handledBy: "adapter" })
  });

  const executor = createSkillExecutor({ registry, adapter });
  const result = await executor.execute("notification.email", {}, createContext());

  assert.equal(result.ok, true);
  assert.equal(result.data.handledBy, "adapter");
});

test("adapter noop nao bloqueia skill local", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry);
  const executor = createSkillExecutor({ registry, adapter: createNoopSkillAdapter() });
  const result = await executor.execute("finance.getinvoice", {}, createContext());
  assert.equal(result.ok, true);
  assert.equal(result.data.invoiceId, "inv-1");
});

test("evento de execucao emitido", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry);
  const executor = createSkillExecutor({ registry });
  await executor.execute("finance.getinvoice", {}, createContext());

  const names = executor.eventEmitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(SKILL_EVENTS.SKILL_EXECUTION_STARTED));
  assert.ok(names.includes(SKILL_EVENTS.SKILL_EXECUTION_SUCCEEDED));
});

test("evento de execucao falha emitido", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, {
    name: "finance.fail2",
    execute: async () => {
      throw new Error("boom");
    }
  });
  const executor = createSkillExecutor({ registry });
  await executor.execute("finance.fail2", {}, createContext());

  const names = executor.eventEmitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(SKILL_EVENTS.SKILL_EXECUTION_FAILED));
});

test("evento permission denied emitido", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, { permissions: ["finance:super"] });
  const executor = createSkillExecutor({ registry });
  await executor.execute("finance.getinvoice", {}, createContext());

  const names = executor.eventEmitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(SKILL_EVENTS.SKILL_PERMISSION_DENIED));
});

test("normalizeSkillName aplicado no executor", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry, { name: "finance.getinvoice" });
  const executor = createSkillExecutor({ registry });

  const result = await executor.execute("  FINANCE.GETINVOICE  ", {}, createContext());
  assert.equal(result.ok, true);
});

test("createToolExecutor funciona como alias do executor", async () => {
  const registry = createSkillRegistry();
  registerSkill(registry);
  const executor = createToolExecutor({ registry });

  const result = await executor.execute("finance.getinvoice", {}, createContext());
  assert.equal(result.ok, true);
});