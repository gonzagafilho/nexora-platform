const {
  PLATFORM_APPS,
  validateAppDefinition,
  normalizeProjectKey
} = require("./contracts");
const { PlatformError } = require("./errors");

function createAppRegistry(seedApps = PLATFORM_APPS) {
  const appsById = new Map();
  const appIdByProjectKey = new Map();

  function validateApp(app) {
    return validateAppDefinition(app);
  }

  function registerApp(app) {
    const normalized = validateApp(app);

    if (appsById.has(normalized.id)) {
      throw new PlatformError(`App already registered: ${normalized.id}`, {
        code: "APP_ALREADY_REGISTERED",
        statusCode: 409
      });
    }

    if (appIdByProjectKey.has(normalized.projectKey)) {
      throw new PlatformError(`Project key already in use: ${normalized.projectKey}`, {
        code: "PROJECT_KEY_ALREADY_REGISTERED",
        statusCode: 409
      });
    }

    appsById.set(normalized.id, normalized);
    appIdByProjectKey.set(normalized.projectKey, normalized.id);
    return normalized;
  }

  function listApps() {
    return Array.from(appsById.values());
  }

  function getApp(id) {
    const appId = String(id || "").trim().toLowerCase();
    return appsById.get(appId) || null;
  }

  function getEnabledApps() {
    return listApps().filter((app) => app.enabled);
  }

  function getAppByProjectKey(projectKey) {
    const normalizedProjectKey = normalizeProjectKey(projectKey);
    const appId = appIdByProjectKey.get(normalizedProjectKey);
    return appId ? getApp(appId) : null;
  }

  (Array.isArray(seedApps) ? seedApps : []).forEach((app) => {
    registerApp(app);
  });

  return {
    listApps,
    getApp,
    getEnabledApps,
    getAppByProjectKey,
    registerApp,
    validateApp
  };
}

module.exports = {
  createAppRegistry
};
