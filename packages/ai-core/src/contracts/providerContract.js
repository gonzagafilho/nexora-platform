const { ProviderError } = require("../errors/ProviderError");

function assertProvider(provider) {
  if (!provider || typeof provider !== "object") {
    throw new ProviderError("Provider must be an object", "INVALID_PROVIDER");
  }

  if (typeof provider.name !== "string" || provider.name.trim().length === 0) {
    throw new ProviderError("Provider must expose a valid name", "INVALID_PROVIDER_NAME");
  }

  if (typeof provider.execute !== "function") {
    throw new ProviderError("Provider must expose execute(prompt, context)", "INVALID_PROVIDER_EXECUTE");
  }

  if (typeof provider.health !== "function") {
    throw new ProviderError("Provider must expose health()", "INVALID_PROVIDER_HEALTH");
  }

  if (typeof provider.capabilities !== "function") {
    throw new ProviderError("Provider must expose capabilities()", "INVALID_PROVIDER_CAPABILITIES");
  }
}

module.exports = {
  assertProvider
};