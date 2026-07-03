const test = require("node:test");
const assert = require("node:assert/strict");

const { applyOrchestratorPolicy, applyStepPolicy } = require("../src/policies/orchestratorPolicy");

function plan(overrides = {}) {
  return {
    id: "p1",
    tenantId: "tenant-1",
    confirmationRequired: false,
    ...overrides
  };
}

function context(overrides = {}) {
  return {
    tenantId: "tenant-1",
    role: "admin",
    permissions: ["protocol:read", "notification:write", "finance:write"],
    enabledModules: ["protocol", "notification", "finance"],
    confirm: true,
    ...overrides
  };
}

test("tenantId obrigatorio", () => {
  assert.throws(() => applyOrchestratorPolicy(plan(), { tenantId: null }), { code: "MISSING_TENANT_ID" });
});

test("cross tenant bloqueado", () => {
  assert.throws(
    () => applyOrchestratorPolicy(plan({ tenantId: "tenant-x" }), context({ tenantId: "tenant-y" })),
    { code: "CROSS_TENANT_BLOCKED" }
  );
});

test("confirmation required bloqueia", () => {
  assert.throws(
    () => applyOrchestratorPolicy(plan({ confirmationRequired: true }), context({ confirm: false })),
    { code: "CONFIRMATION_REQUIRED" }
  );
});

test("step permission read ok", () => {
  assert.equal(applyStepPolicy({ id: "s1", tool: "protocol.list", confirmationRequired: false }, context()), true);
});

test("step permission denied", () => {
  assert.throws(
    () => applyStepPolicy({ id: "s1", tool: "notification.whatsapp", confirmationRequired: false }, context({ permissions: [] })),
    { code: "PERMISSION_DENIED" }
  );
});

test("step module disabled", () => {
  assert.throws(
    () => applyStepPolicy({ id: "s1", tool: "notification.whatsapp", confirmationRequired: false }, context({ enabledModules: ["protocol"] })),
    { code: "MODULE_DISABLED" }
  );
});

test("viewer bloqueado mutavel", () => {
  assert.throws(
    () => applyStepPolicy({ id: "s1", tool: "finance.createbolepix", confirmationRequired: false }, context({ role: "viewer" })),
    { code: "VIEWER_MUTATION_BLOCKED" }
  );
});

test("step confirmation required", () => {
  assert.throws(
    () => applyStepPolicy({ id: "s1", tool: "protocol.list", confirmationRequired: true }, context({ confirm: false })),
    { code: "STEP_CONFIRMATION_REQUIRED" }
  );
});