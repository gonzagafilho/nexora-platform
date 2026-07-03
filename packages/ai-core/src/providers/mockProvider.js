const { ProviderError } = require("../errors/ProviderError");

function createMockProvider(options = {}) {
  const name = options.name || "mock";

  return {
    name,
    async generate(input) {
      if (!input || typeof input.prompt !== "string") {
        throw new ProviderError("Mock provider requires a string prompt", "INVALID_PROMPT");
      }

      const text = options.fixedResponse || `Mock response: ${input.prompt}`;
      return {
        text,
        usage: {
          promptTokens: input.prompt.length,
          completionTokens: text.length,
          totalTokens: input.prompt.length + text.length
        },
        metadata: {
          provider: name,
          model: options.model || "mock-v1"
        }
      };
    }
  };
}

module.exports = {
  createMockProvider
};