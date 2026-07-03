const { ProviderError } = require("../errors/ProviderError");

function createOpenAIProvider(options = {}) {
  if (typeof options.invoke !== "function") {
    throw new ProviderError(
      "OpenAI provider requires an invoke function adapter",
      "MISSING_OPENAI_ADAPTER"
    );
  }

  const name = options.name || "openai";

  return {
    name,
    async generate(input) {
      if (!input || typeof input.prompt !== "string") {
        throw new ProviderError("OpenAI provider requires a string prompt", "INVALID_PROMPT");
      }

      const response = await options.invoke({
        prompt: input.prompt,
        context: input.context || {},
        config: input.config || {}
      });

      if (!response || typeof response.text !== "string") {
        throw new ProviderError("OpenAI adapter must return an object with text", "INVALID_ADAPTER_RESPONSE");
      }

      return {
        text: response.text,
        usage: response.usage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        metadata: {
          provider: name,
          model: response.model || "openai-adapter",
          raw: response.raw || null
        }
      };
    }
  };
}

module.exports = {
  createOpenAIProvider
};