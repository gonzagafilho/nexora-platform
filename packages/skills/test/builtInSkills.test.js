const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createSkillRegistry,
  createSkillExecutor,
  createFinanceSkill,
  createAssociateSkill,
  createProtocolSkill,
  createProjectSkill,
  createNotificationSkill,
  createWorkflowSkill,
  createReportSkill,
  createInMemorySkillAdapter,
  normalizeSkillName,
  validateSkillAdapter,
  validateSkillDefinition
} = require("../src");

function context(overrides = {}) {
  return {
    tenantId: "tenant-1",
    userId: "user-1",
    role: "admin",
    permissions: [
      "finance:read",
      "finance:write",
      "associate:read",
      "protocol:read",
      "protocol:write",
      "project:read",
      "notification:send",
      "workflow:read",
      "workflow:write",
      "report:generate"
    ],
    enabledModules: ["finance", "associate", "protocol", "project", "notification", "workflow", "report"],
    confirmedSkills: ["finance.createbolepix"],
    ...overrides
  };
}

function registerBuiltIns(registry) {
  [
    ...createFinanceSkill(),
    ...createAssociateSkill(),
    ...createProtocolSkill(),
    ...createProjectSkill(),
    ...createNotificationSkill(),
    ...createWorkflowSkill(),
    ...createReportSkill()
  ].forEach((skill) => registry.register(skill));
}

test("built-in finance executa createBolePix", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("finance.createbolepix", { amount: 100 }, context());
  assert.equal(result.ok, true);
});

test("built-in finance listInvoices", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("finance.listinvoices", {}, context());
  assert.equal(Array.isArray(result.data), true);
});

test("built-in associate find", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("associate.find", { id: "a-1" }, context());
  assert.equal(result.ok, true);
});

test("built-in protocol create", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("protocol.create", {}, context());
  assert.equal(result.ok, true);
});

test("built-in notification whatsapp", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("notification.whatsapp", {}, context());
  assert.equal(result.ok, true);
});

test("built-in project details", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("project.details", { id: "proj-a" }, context());
  assert.equal(result.ok, true);
});

test("built-in workflow status", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("workflow.status", {}, context());
  assert.equal(result.ok, true);
});

test("built-in report generatePDF", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute("report.generatepdf", {}, context());
  assert.equal(result.ok, true);
});

test("inMemory adapter capabilities", () => {
  const adapter = createInMemorySkillAdapter({ "finance.getinvoice": async () => ({}) });
  assert.equal(adapter.listCapabilities().includes("finance.getinvoice"), true);
});

test("validateSkillAdapter invalido", () => {
  assert.throws(() => validateSkillAdapter({ execute: async () => ({}) }), {
    name: "SkillValidationError"
  });
});

test("validateSkillDefinition invalida", () => {
  assert.throws(() => validateSkillDefinition({ name: "bad", execute: async () => ({}) }), {
    name: "SkillValidationError"
  });
});

test("normalizeSkillName", () => {
  assert.equal(normalizeSkillName("  FINANCE.GETINVOICE  "), "finance.getinvoice");
});

test("isolamento por tenant em payload", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute(
    "finance.getinvoice",
    { tenantId: "other-tenant" },
    context({ tenantId: "tenant-1" })
  );
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "CROSS_TENANT_BLOCKED");
});

test("actions context pode sobrescrever built-in", async () => {
  const registry = createSkillRegistry();
  registerBuiltIns(registry);
  const executor = createSkillExecutor({ registry });
  const result = await executor.execute(
    "finance.getinvoice",
    { invoiceId: "inv-z" },
    context({
      actions: {
        getInvoice: async () => ({ invoiceId: "inv-custom" })
      }
    })
  );
  assert.equal(result.data.invoiceId, "inv-custom");
});