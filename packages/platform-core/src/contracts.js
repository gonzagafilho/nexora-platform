const { PlatformError } = require("./errors");

const associacoes = require("./apps/associacoes");
const xpdcnet = require("./apps/xpdcnet");
const guardian = require("./apps/guardian");
const chatbot = require("./apps/chatbot");
const financeiro = require("./apps/financeiro");
const workponto = require("./apps/workponto");
const palpites = require("./apps/palpites");

const PLATFORM_APPS = [associacoes, xpdcnet, guardian, chatbot, financeiro, workponto, palpites];

const PLATFORM_CORE_MODULES = [
  "ai",
  "memory",
  "skills",
  "orchestrator",
  "runtime",
  "events",
  "auth",
  "permissions",
  "audit",
  "integrations"
];

function normalizeProjectKey(projectKey) {
  return String(projectKey || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function normalizeString(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeStringList(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
}

function normalizeRouteList(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function validateAppDefinition(app) {
  if (!app || typeof app !== "object") {
    throw new PlatformError("App definition must be an object.", {
      code: "INVALID_APP_DEFINITION",
      statusCode: 400
    });
  }

  const id = normalizeString(app.id);
  const projectKey = normalizeProjectKey(app.projectKey || id);
  const name = String(app.name || "").trim();

  if (!id) {
    throw new PlatformError("App id is required.", {
      code: "INVALID_APP_ID",
      statusCode: 400
    });
  }

  if (!projectKey) {
    throw new PlatformError("App projectKey is required.", {
      code: "INVALID_APP_PROJECT_KEY",
      statusCode: 400
    });
  }

  if (!name) {
    throw new PlatformError("App name is required.", {
      code: "INVALID_APP_NAME",
      statusCode: 400
    });
  }

  return {
    id,
    projectKey,
    name,
    version: String(app.version || "0.0.1").trim(),
    icon: String(app.icon || "grid").trim(),
    description: String(app.description || "").trim(),
    enabled: app.enabled !== false,
    modules: normalizeStringList(app.modules),
    permissions: normalizeStringList(app.permissions),
    skills: normalizeStringList(app.skills || app.agentProfile?.primary || []),
    routes: normalizeRouteList(app.routes),
    agentProfile:
      app.agentProfile && typeof app.agentProfile === "object"
        ? {
            primary: normalizeStringList(app.agentProfile.primary),
            fallback: normalizeString(app.agentProfile.fallback || "assistant") || "assistant"
          }
        : { primary: ["assistant"], fallback: "assistant" }
  };
}

function getDefaultAppIdFromProjectKey(projectKey) {
  const normalized = normalizeProjectKey(projectKey);
  if (!normalized) return "associacoes";

  const aliases = {
    associacao: "associacoes",
    associacoes: "associacoes",
    "nexora-associacoes": "associacoes",
    xpdcnet: "xpdcnet",
    guardian: "guardian",
    chatbot: "chatbot",
    financeiro: "financeiro",
    workponto: "workponto",
    palpites: "palpites"
  };

  return aliases[normalized] || normalized;
}

module.exports = {
  PLATFORM_APPS,
  PLATFORM_CORE_MODULES,
  validateAppDefinition,
  normalizeProjectKey,
  getDefaultAppIdFromProjectKey
};
