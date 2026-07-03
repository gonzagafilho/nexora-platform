const test = require("node:test");
const assert = require("node:assert/strict");

const { createSkillRegistry, createToolRegistry, SKILL_EVENTS } = require("../src");

function sampleSkill(overrides = {}) {
  return {
    name: "finance.getinvoice",
    description: "Get invoice",
    version: "1.0.0",
    category: "finance",
    permissions: ["finance:read"],
    confirmationRequired: false,
    enabled: true,
    inputSchema: {},
    outputSchema: {},
    execute: async () => ({ ok: true }),
    ...overrides
  };
}

test("register e get skill", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill());
  assert.ok(registry.get("finance.getinvoice"));
});

test("has e list skills", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill());
  assert.equal(registry.has("finance.getinvoice"), true);
  assert.equal(registry.list().length, 1);
});

test("listByCategory filtra categoria", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill());
  registry.register(sampleSkill({ name: "associate.find", category: "associate" }));

  assert.equal(registry.listByCategory("finance").length, 1);
  assert.equal(registry.listByCategory("associate").length, 1);
});

test("listTools e getTool funcionam como alias", () => {
  const registry = createToolRegistry();
  registry.register(sampleSkill());

  assert.equal(registry.listTools().length, 1);
  assert.ok(registry.getTool("finance.getinvoice"));
});

test("searchTools busca por nome e descricao", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill({ description: "Consulta invoice financeira" }));
  registry.register(sampleSkill({ name: "associate.find", category: "associate", description: "Busca associado" }));

  assert.equal(registry.searchTools("invoice").length, 1);
  assert.equal(registry.searchTools("associado").length, 1);
});

test("skill registrada expoe metadados de tool", () => {
  const registry = createSkillRegistry();
  const created = registry.register(sampleSkill());

  assert.equal(created.toolId, "finance.getinvoice");
  assert.equal(created.toolName, "finance.getinvoice");
  assert.equal(created.toolCategory, "finance");
  assert.equal(created.toolDescription, "Get invoice");
});

test("enable e disable skill", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill());

  registry.disable("finance.getinvoice");
  assert.equal(registry.get("finance.getinvoice").enabled, false);

  registry.enable("finance.getinvoice");
  assert.equal(registry.get("finance.getinvoice").enabled, true);
});

test("unregister remove skill", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill());
  assert.equal(registry.unregister("finance.getinvoice"), true);
  assert.equal(registry.get("finance.getinvoice"), null);
});

test("validate skill invalida", () => {
  const registry = createSkillRegistry();
  assert.throws(
    () => registry.register({ name: "invalida", execute: async () => ({}) }),
    { name: "SkillValidationError" }
  );
});

test("registry emite eventos de lifecycle", () => {
  const registry = createSkillRegistry();
  registry.register(sampleSkill());
  registry.disable("finance.getinvoice");
  registry.enable("finance.getinvoice");
  registry.unregister("finance.getinvoice");

  const names = registry.eventEmitter.getHistory().map((event) => event.eventName);
  assert.ok(names.includes(SKILL_EVENTS.SKILL_REGISTERED));
  assert.ok(names.includes(SKILL_EVENTS.SKILL_DISABLED));
  assert.ok(names.includes(SKILL_EVENTS.SKILL_ENABLED));
  assert.ok(names.includes(SKILL_EVENTS.SKILL_UNREGISTERED));
});