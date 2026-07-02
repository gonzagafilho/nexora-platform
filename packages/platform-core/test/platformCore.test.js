const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createAppRegistry,
  createContextProvider,
  createPlatformService
} = require("../src");

test("registry lista 7 apps", () => {
  const registry = createAppRegistry();
  assert.equal(registry.listApps().length, 7);
});

test("todos apps tem projectKey unico", () => {
  const registry = createAppRegistry();
  const apps = registry.listApps();
  const uniqueProjectKeys = new Set(apps.map((app) => app.projectKey));
  assert.equal(uniqueProjectKeys.size, apps.length);
});

test("getApp(associacoes)", () => {
  const registry = createAppRegistry();
  const app = registry.getApp("associacoes");
  assert.ok(app);
  assert.equal(app.id, "associacoes");
});

test("getAppByProjectKey(xpdcnet)", () => {
  const registry = createAppRegistry();
  const app = registry.getAppByProjectKey("xpdcnet");
  assert.ok(app);
  assert.equal(app.id, "xpdcnet");
});

test("registerApp valida app invalido", () => {
  const registry = createAppRegistry([]);
  assert.throws(() => registry.registerApp({ name: "Sem Id" }), {
    name: "PlatformError",
    code: "INVALID_APP_ID"
  });
});

test("buildContext retorna permissoes e skills", () => {
  const provider = createContextProvider();
  const context = provider.buildContext({
    tenantId: "tenant-01",
    userId: "user-01",
    appId: "associacoes",
    projectKey: "associacoes",
    role: "admin",
    enabledModules: ["core", "financial", "protocols"]
  });

  assert.ok(Array.isArray(context.permissions));
  assert.ok(context.permissions.includes("module:core"));
  assert.ok(Array.isArray(context.availableSkills));
  assert.ok(context.availableSkills.includes("finance"));
});

test("platformService.getStatus retorna health online", () => {
  const service = createPlatformService();
  const status = service.getStatus({ tenantId: "tenant-01" });
  assert.equal(status.health, "online");
});

test("platformService.getAppDashboard retorna modulos e skills", () => {
  const service = createPlatformService();
  const dashboard = service.getAppDashboard("chatbot", {
    tenantId: "tenant-01",
    userId: "user-01",
    projectKey: "chatbot",
    enabledModules: ["core", "ai", "memory", "skills", "orchestrator"]
  });

  assert.ok(Array.isArray(dashboard.modules));
  assert.ok(dashboard.modules.includes("orchestrator"));
  assert.ok(Array.isArray(dashboard.skills));
  assert.ok(dashboard.skills.includes("assistant"));
});

test("isolamento logico por appId/projectKey", () => {
  const provider = createContextProvider();
  const associacoesContext = provider.buildContext({
    tenantId: "tenant-01",
    userId: "user-01",
    appId: "associacoes",
    projectKey: "associacoes",
    enabledModules: ["core", "associates"]
  });

  const financeiroContext = provider.buildContext({
    tenantId: "tenant-01",
    userId: "user-01",
    appId: "financeiro",
    projectKey: "financeiro",
    enabledModules: ["core", "financial"]
  });

  assert.notEqual(associacoesContext.app.id, financeiroContext.app.id);
  assert.notDeepEqual(associacoesContext.permissions, financeiroContext.permissions);
  assert.notEqual(associacoesContext.projectKey, financeiroContext.projectKey);
});
