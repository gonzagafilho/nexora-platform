const { PlanValidationError } = require("../errors/PlanValidationError");
const { validateToolRuntime } = require("./toolContract");

function createRuntimeContext(input = {}) {
  const context = {
    tenantId: input.tenantId || null,
    userId: input.userId || null,
    projectKey: input.projectKey || null,
    appId: input.appId || null,
    role: input.role || "operator",
    permissions: Array.isArray(input.permissions) ? input.permissions : [],
    enabledModules: Array.isArray(input.enabledModules) ? input.enabledModules : [],
    variables: input.variables && typeof input.variables === "object" ? input.variables : {},
    memory: input.memory || null,
    tools: input.tools || {
      async execute(toolName, payload) {
        return { toolName, payload, ok: true, provider: "noop-tools" };
      },
      listTools() {
        return [];
      }
    },
    locale: input.locale || "pt-BR",
    metadata: input.metadata && typeof input.metadata === "object" ? input.metadata : {}
  };

  validateRuntimeContext(context);
  return context;
}

function validateRuntimeContext(context = {}) {
  if (!context.tenantId) {
    throw new PlanValidationError("tenantId is required", "MISSING_TENANT_ID");
  }

  validateToolRuntime(context.tools);
  return true;
}

module.exports = {
  createRuntimeContext,
  validateRuntimeContext
};