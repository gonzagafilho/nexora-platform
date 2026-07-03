const { ProviderError } = require("../errors/ProviderError");

function createOpenAIProvider(options = {}) {
  if (typeof options.invoke !== "function") {
    throw new ProviderError(
      "OpenAI provider requires an invoke function adapter",
      "MISSING_OPENAI_ADAPTER"
    );
  }

  const name = options.name || "openai";
  const declaredCapabilities = options.capabilities || ["chat", "tool-calling", "summarization"];

  return {
    name,
    async execute(prompt, context = {}) {
      if (typeof prompt !== "string") {
        throw new ProviderError("OpenAI provider requires a string prompt", "INVALID_PROMPT");
      }

      const response = await options.invoke({
        prompt,
        context: context.context || {},
        config: context.config || {}
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
  createOpenAIProvider
};