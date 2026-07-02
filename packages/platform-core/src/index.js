const { createAppRegistry } = require("./appRegistry");
const { createContextProvider } = require("./contextProvider");
const { createPlatformService } = require("./platformService");
const {
  PLATFORM_APPS,
  PLATFORM_CORE_MODULES,
  validateAppDefinition,
  normalizeProjectKey,
  getDefaultAppIdFromProjectKey
} = require("./contracts");
const { NEXORA_PLATFORM_VERSION } = require("./version");
const { PlatformError } = require("./errors");

module.exports = {
  createAppRegistry,
  createContextProvider,
  createPlatformService,
  NEXORA_PLATFORM_VERSION,
  PLATFORM_APPS,
  PLATFORM_CORE_MODULES,
  PlatformError,
  validateAppDefinition,
  normalizeProjectKey,
  getDefaultAppIdFromProjectKey
};
