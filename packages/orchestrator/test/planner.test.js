const test = require("node:test");
const assert = require("node:assert/strict");

const { createExecutionPlanner, normalizePlan, validatePlan, createRuntimeContext } = require("../src");

function context(overrides = {}) {
  return createRuntimeContext({
    tenantId: "tenant-1",
    userId: "user-1",
    permissions: ["protocol:read", "notification:write", "report:write", "associate:read"],
    enabledModules: ["protocol", "notification", "report", "associate"],
    tools: {
      async execute() {
        return { ok: true };
      },
      listTools() {
        return ["protocol.list"]; 
      }
    },
    ...overrides
  });
}

test("criar plano por steps", () => {
  const planner = createExecutionPlanner();
  const plan = planner.createPlan({
    intent: "custom",
    context: context(),
    steps: [{ tool: "protocol.list" }]
  });

  assert.equal(plan.steps.length, 1);
  assert.equal(plan.steps[0].tool, "protocol.list");
});

test("criar plano por intent listar protocolos", () => {
  const planner = createExecutionPlanner();
  const plan = planner.createPlan({
    intent: "listar protocolos",
    message: "listar protocolos",
    context: context()
  });

  assert.equal(plan.steps[0].tool, "protocol.list");
});

test("criar plano por intent enviar whatsapp", () => {
  const planner = createExecutionPlanner();
  const plan = planner.createPlan({
    intent: "enviar whatsapp",
    message: "enviar whatsapp",
    context: context()
  });
  assert.equal(plan.steps[0].tool, "notification.whatsapp");
});

test("criar plano por intent gerar relatorio", () => {
  const planner = createExecutionPlanner();
  const plan = planner.createPlan({
    intent: "gerar relatório",
    message: "gerar relatório",
    context: context()
  });
  assert.equal(plan.steps[0].tool, "report.generatepdf");
});

test("criar plano por intent listar associados", () => {
  const planner = createExecutionPlanner();
  const plan = planner.createPlan({
    intent: "listar associados",
    message: "listar associados",
    context: context()
  });
  assert.equal(plan.steps[0].tool, "associate.list");
});

test("default noop plan", () => {
  const planner = createExecutionPlanner();
  const plan = planner.createPlan({
    intent: "nada a ver",
    message: "mensagem desconhecida",
    context: context()
  });
  assert.equal(plan.steps[0].tool, "noop.plan");
});

test("validar plano invalido sem tenant", () => {
  const plan = normalizePlan({
    userId: "u1",
    steps: [{ tool: "protocol.list" }]
  });
  assert.throws(() => validatePlan(plan), { name: "PlanValidationError" });
});

test("dependsOn invalido", () => {
  const plan = normalizePlan({
    tenantId: "t1",
    userId: "u1",
    steps: [{ id: "s1", tool: "protocol.list", dependsOn: ["s2"] }]
  });
  assert.throws(() => validatePlan(plan), { code: "INVALID_STEP_DEPENDENCY" });
});

test("runtime context default role e locale", () => {
  const runtime = createRuntimeContext({
    tenantId: "t1",
    tools: {
      async execute() {
        return {};
      },
      listTools() {
        return [];
      }
    }
  });

  assert.equal(runtime.role, "operator");
  assert.equal(runtime.locale, "pt-BR");
});

test("runtime context exige tenantId", () => {
  assert.throws(
    () =>
      createRuntimeContext({
        tools: {
          async execute() {
            return {};
          },
          listTools() {
            return [];
          }
        }
      }),
    { code: "MISSING_TENANT_ID" }
  );
});