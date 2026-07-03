const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createPipelineExecutor,
  createRuntimeContext,
  normalizePlan,
  ORCHESTRATOR_EVENTS,
  PIPELINE_STATUS
} = require("../src");

function tools(overrides = {}) {
  return {
    async execute(name, input) {
      return { name, input, ok: true };
    },
    listTools() {
      return ["protocol.list", "notification.whatsapp", "report.generatepdf", "associate.list", "finance.createbolepix"];
    },
    ...overrides
  };
}

function context(overrides = {}) {
  return createRuntimeContext({
    tenantId: "tenant-1",
    userId: "user-1",
    role: "admin",
    permissions: ["protocol:read", "notification:write", "report:write", "associate:read", "finance:write"],
    enabledModules: ["protocol", "notification", "report", "associate", "finance"],
    tools: tools(),
    ...overrides
  });
}

test("execute sequential", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [
      { id: "s1", tool: "protocol.list" },
      { id: "s2", tool: "associate.list", dependsOn: ["s1"] }
    ]
  });

  const result = await executor.executePlan(plan, context());
  assert.equal(result.ok, true);
  assert.equal(result.status, PIPELINE_STATUS.COMPLETED);
});

test("execute parallel", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [
      { id: "s1", tool: "protocol.list", strategy: "parallel" },
      { id: "s2", tool: "associate.list", strategy: "parallel" },
      { id: "s3", tool: "notification.whatsapp", dependsOn: ["s1", "s2"], strategy: "parallel" }
    ]
  });

  const result = await executor.executePlan(plan, context());
  assert.equal(result.ok, true);
});

test("retry funciona", async () => {
  let calls = 0;
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [{ id: "s1", tool: "protocol.list", retry: 1 }]
  });

  const runtime = context({
    tools: tools({
      async execute() {
        calls += 1;
        if (calls === 1) {
          throw new Error("fail once");
        }
        return { ok: true };
      }
    })
  });

  const result = await executor.executePlan(plan, runtime);
  assert.equal(result.ok, true);
  assert.equal(calls, 2);
});

test("timeout falha step", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [{ id: "s1", tool: "protocol.list", timeoutMs: 10 }]
  });

  const runtime = context({
    tools: tools({
      async execute() {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { ok: true };
      }
    })
  });

  const result = await executor.executePlan(plan, runtime);
  assert.equal(result.ok, false);
});

test("rollback basico quando configurado", async () => {
  let rolledBack = false;
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [
      {
        id: "s1",
        tool: "protocol.list",
        rollback: {
          async execute() {
            rolledBack = true;
            return { ok: true };
          }
        }
      }
    ]
  });

  const runtime = context({
    tools: tools({
      async execute() {
        throw new Error("boom");
      }
    })
  });

  const result = await executor.executePlan(plan, runtime);
  assert.equal(result.ok, false);
  assert.equal(rolledBack, true);
});

test("confirmation required bloqueia", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    confirmationRequired: true,
    steps: [{ id: "s1", tool: "protocol.list" }]
  });

  const result = await executor.executePlan(plan, context({ confirm: false }));
  assert.equal(result.ok, false);
});

test("permission denied", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [{ id: "s1", tool: "notification.whatsapp" }]
  });

  const result = await executor.executePlan(plan, context({ permissions: ["protocol:read"] }));
  assert.equal(result.ok, false);
});

test("viewer bloqueado para tool mutavel", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [{ id: "s1", tool: "finance.createbolepix" }]
  });

  const result = await executor.executePlan(plan, context({ role: "viewer" }));
  assert.equal(result.ok, false);
});

test("tool contract usa context.tools", async () => {
  let called = false;
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [{ id: "s1", tool: "protocol.list" }]
  });

  const runtime = context({
    tools: tools({
      async execute() {
        called = true;
        return { ok: true };
      }
    })
  });

  await executor.executePlan(plan, runtime);
  assert.equal(called, true);
});

test("eventos pipeline e step emitidos", async () => {
  const executor = createPipelineExecutor();
  const plan = normalizePlan({
    tenantId: "tenant-1",
    userId: "user-1",
    steps: [{ id: "s1", tool: "protocol.list" }]
  });

  await executor.executePlan(plan, context());
  const names = executor.eventEmitter.getHistory().map((e) => e.eventName);
  assert.ok(names.includes(ORCHESTRATOR_EVENTS.PIPELINE_CREATED));
  assert.ok(names.includes(ORCHESTRATOR_EVENTS.STEP_STARTED));
  assert.ok(names.includes(ORCHESTRATOR_EVENTS.STEP_COMPLETED));
});