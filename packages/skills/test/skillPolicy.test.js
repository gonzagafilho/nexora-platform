const test = require("node:test");
const assert = require("node:assert/strict");

const { validateSkillPolicy } = require("../src/policy/skillPolicy");

function skill(overrides = {}) {
  return {
    name: "finance.getinvoice",
    enabled: true,
    permissions: ["finance:read"],
    confirmationRequired: false,
    ...overrides
  };
}

function context(overrides = {}) {
  return {
    tenantId: "tenant-1",
    userId: "user-1",
    role: "admin",
    permissions: ["finance:read", "finance:write"],
    enabledModules: ["finance", "notification", "report", "associate", "project", "protocol", "workflow"],
    confirmedSkills: ["finance.createbolepix"],
    ...overrides
  };
}

test("policy exige tenantId", () => {
  assert.throws(() => validateSkillPolicy(skill(), {}, context({ tenantId: null })), {
    code: "MISSING_TENANT_ID"
  });
});

test("policy exige userId quando precisa permissao", () => {
  assert.throws(() => validateSkillPolicy(skill(), {}, context({ userId: null })), {
    code: "MISSING_USER_ID"
  });
});

test("policy valida permissions", () => {
  assert.throws(() => validateSkillPolicy(skill({ permissions: ["finance:admin"] }), {}, context()), {
    code: "PERMISSION_DENIED"
  });
});

test("policy valida enabledModules", () => {
  assert.throws(() => validateSkillPolicy(skill(), {}, context({ enabledModules: ["associate"] })), {
    code: "MODULE_DISABLED"
  });
});

test("policy bloqueia skill disabled", () => {
  assert.throws(() => validateSkillPolicy(skill({ enabled: false }), {}, context()), {
    code: "SKILL_DISABLED"
  });
});

test("policy exige confirmation quando required", () => {
  assert.throws(
    () => validateSkillPolicy(skill({ name: "finance.createbolepix", confirmationRequired: true }), {}, context({ confirmedSkills: [] })),
    { code: "CONFIRMATION_REQUIRED" }
  );
});

test("policy bloqueia cross tenant", () => {
  assert.throws(
    () => validateSkillPolicy(skill(), { tenantId: "tenant-2" }, context({ tenantId: "tenant-1" })),
    { code: "CROSS_TENANT_BLOCKED" }
  );
});

test("policy valida roles permitidos", () => {
  assert.throws(() => validateSkillPolicy(skill(), {}, context({ role: "guest" })), {
    code: "INVALID_ROLE"
  });
});

test("policy aceita role viewer", () => {
  assert.equal(validateSkillPolicy(skill({ permissions: [] }), {}, context({ role: "viewer" })), true);
});

test("policy passa quando contexto valido", () => {
  assert.equal(validateSkillPolicy(skill(), {}, context()), true);
});