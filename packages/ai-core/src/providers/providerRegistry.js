const { ProviderError } = require("../errors/ProviderError");
const { assertProvider } = require("../contracts/providerContract");
const { createMockProvider } = require("./mockProvider");
const { createOpenAIProvider } = require("./openaiProvider");

function createProviderRegistry(initialProviders = []) {
  const providers = new Map();

  function registerProvider(provider) {
    assertProvider(provider);

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
    checkProviderHealth: async (name) => getProvider(name).health(),
    createOpenAIProvider,
    createMockProvider
  };
}

module.exports = {
  createProviderRegistry
};