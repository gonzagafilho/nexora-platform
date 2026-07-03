const { ProviderError } = require("../errors/ProviderError");
const { createMockProvider } = require("./mockProvider");
const { createOpenAIProvider } = require("./openaiProvider");

function createProviderRegistry(initialProviders = []) {
  const providers = new Map();

  function registerProvider(provider) {
    if (!provider || typeof provider.name !== "string" || typeof provider.generate !== "function") {
      throw new ProviderError(
        "Provider must expose name and generate(input)",
        "INVALID_PROVIDER"
      );
    }

    providers.set(provider.name, provider);
    return provider;
  }

  function getProvider(name) {
    const provider = providers.get(name);
    if (!provider) {
      throw new ProviderError(`Provider not found: ${name}`, "PROVIDER_NOT_FOUND", { name });
    }
    return provider;
  }

  function hasProvider(name) {
    return providers.has(name);
  }

  function listProviders() {
    return Array.from(providers.values());
  }

  registerProvider(createMockProvider());

  initialProviders.forEach(registerProvider);

  return {
    registerProvider,
    getProvider,
    hasProvider,
    listProviders,
    createOpenAIProvider,
    createMockProvider
  };
}

module.exports = {
  createProviderRegistry
};