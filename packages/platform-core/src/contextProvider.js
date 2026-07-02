const { createAppRegistry } = require("./appRegistry");
const {
  PLATFORM_CORE_MODULES,
  normalizeProjectKey,
  getDefaultAppIdFromProjectKey
} = require("./contracts");
const { NEXORA_PLATFORM_VERSION } = require("./version");
const { PlatformError } = require("./errors");

function normalizeList(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
}

function createContextProvider(options = {}) {
  const registry = options.registry || createAppRegistry();
  const platformVersion = options.platformVersion || NEXORA_PLATFORM_VERSION;
  const coreModules = Array.isArray(options.coreModules)
    ? options.coreModules
    : PLATFORM_CORE_MODULES;

  function buildContext({
    tenantId,
    userId,
    appId,
    projectKey,
    role,
    enabledModules
  } = {}) {
    const normalizedProjectKey = normalizeProjectKey(projectKey);
    const resolvedAppId = String(appId || "").trim().toLowerCase();

    const app = resolvedAppId
      ? registry.getApp(resolvedAppId)
      : registry.getAppByProjectKey(normalizedProjectKey) ||
        registry.getApp(getDefaultAppIdFromProjectKey(normalizedProjectKey));

    if (!app) {
      throw new PlatformError("Unable to resolve app for context.", {
        code: "APP_NOT_FOUND",
        statusCode: 404,
        details: {
          appId: resolvedAppId || null,
          projectKey: normalizedProjectKey || null
        }
      });
    }

    const modules = normalizeList(enabledModules);
    const permissions = Array.isArray(app.permissions) ? app.permissions : [];
    const availableSkills = Array.isArray(app.skills)
      ? app.skills
      : app.agentProfile?.primary || [];

    return {
      tenantId: tenantId == null ? null : String(tenantId),
      userId: userId == null ? null : String(userId),
      app,
      projectKey: app.projectKey || normalizedProjectKey || app.id,
      permissions,
      role: String(role || "").trim().toLowerCase(),
      enabledModules: modules,
      availableSkills,
      coreModules,
      platformVersion
    };
  }

  return {
    buildContext
  };
}

module.exports = {
  createContextProvider
};
