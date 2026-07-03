const { AIError } = require("../errors/AIError");

function normalizeContext(context = {}) {
  if (context === null || typeof context !== "object" || Array.isArray(context)) {
    throw new AIError("Context must be an object", "INVALID_CONTEXT");
  }

  return {
    tenantId: context.tenantId || "default",
    userId: context.userId || "anonymous",
    locale: context.locale || "pt-BR",
    timezone: context.timezone || "UTC",
    data: context.data || {}
  };
}

module.exports = {
  normalizeContext
};