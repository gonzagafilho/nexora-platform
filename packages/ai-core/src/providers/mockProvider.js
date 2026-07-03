const { ProviderError } = require("../errors/ProviderError");

function createMockProvider(options = {}) {
  const name = options.name || "mock";
  const declaredCapabilities = options.capabilities || ["chat", "planning", "mock"]; 

  return {
    name,
    async execute(prompt, context = {}) {
      if (typeof prompt !== "string") {
        throw new ProviderError("Mock provider requires a string prompt", "INVALID_PROMPT");
      }

      const text = options.fixedResponse || `Mock response: ${prompt}`;
      return {
        text,
        usage: {
          promptTokens: prompt.length,
          completionTokens: text.length,
          totalTokens: prompt.length + text.length
        },
        metadata: {
          provider: name,
          model: options.model || "mock-v1",
          context
        }
      };
    },
    async health() {
      return {
        status: "up",
        provider: name
      };
    },
    capabilities() {
      return [...declaredCapabilities];
    }
  };
}

module.exports = {
  createMockProvider
};