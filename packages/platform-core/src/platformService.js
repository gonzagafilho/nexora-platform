const { createAppRegistry } = require("./appRegistry");
const { createContextProvider } = require("./contextProvider");
const { PLATFORM_CORE_MODULES } = require("./contracts");
const { NEXORA_PLATFORM_VERSION } = require("./version");
const { PlatformError } = require("./errors");

const adapters = {
  ai: require("./adapters/ai"),
  memory: require("./adapters/memory"),
  skills: require("./adapters/skills"),
  orchestrator: require("./adapters/orchestrator"),
  runtime: require("./adapters/runtime"),
  events: require("./adapters/events"),
  auth: require("./adapters/auth"),
  permissions: require("./adapters/permissions"),
  audit: require("./adapters/audit"),
  integrations: require("./adapters/integrations")
};

function createPlatformService(options = {}) {
  const registry = options.registry || createAppRegistry();
  const contextProvider =
    options.contextProvider ||
    createContextProvider({
      registry,
      platformVersion: options.platformVersion,
      coreModules: options.coreModules
    });
  const platformVersion = options.platformVersion || NEXORA_PLATFORM_VERSION;
  const coreModules = Array.isArray(options.coreModules)
    ? options.coreModules
    : PLATFORM_CORE_MODULES;

  function getStatus(context = {}) {
    const apps = registry.listApps();
    return {
      health: "online",
      platformVersion,
      coreModules,
      apps: {
        total: apps.length,
        enabled: apps.filter((app) => app.enabled).length
      },
      context: {
        tenantId: context.tenantId || null,
        userId: context.userId || null,
        appId: context.app?.id || null,
        projectKey: context.projectKey || null
      },
      timestamp: new Date().toISOString()
    };
  }

  function listApps() {
    const apps = registry.listApps();
    return {
      total: apps.length,
      enabled: apps.filter((app) => app.enabled).length,
      apps
    };
  }

  function getCore() {
    return {
      modules: coreModules.map((moduleName) => {
        const adapter = adapters[moduleName];
        return {
          module: moduleName,
          status: adapter?.status || "adapter-ready"
        };
      }),
      platformVersion
    };
  }

  function getModules() {
    const modules = new Set();
    registry.listApps().forEach((app) => {
      (app.modules || []).forEach((moduleName) => modules.add(moduleName));
    });

    return {
      total: modules.size,
      modules: Array.from(modules).sort()
    };
  }

  function getAppDashboard(appId, context = {}) {
    const app = registry.getApp(appId);
    if (!app) {
      throw new PlatformError(`App not found: ${appId}`, {
        code: "APP_NOT_FOUND",
        statusCode: 404
      });
    }

    const appContext = contextProvider.buildContext({
      ...context,
      appId: app.id,
      projectKey: app.projectKey
    });

    return {
      app: appContext.app,
      status: appContext.app.enabled ? "active" : "inactive",
      modules: appContext.app.modules,
      skills: appContext.availableSkills,
      permissions: appContext.permissions,
      projectKey: appContext.projectKey,
      platformVersion: appContext.platformVersion
    };
  }

  return {
    getStatus,
    listApps,
    getCore,
    getModules,
    getAppDashboard
  };
}

module.exports = {
  createPlatformService
};
