const { assertCopilotInput } = require("../contracts/copilotContract");
const { assertProvider } = require("../contracts/providerContract");
const { createPromptBuilder } = require("./promptBuilder");
const { createConversation } = require("./conversation");

function createCopilot(options = {}) {
  const provider = options.provider;
  const promptBuilder = options.promptBuilder || createPromptBuilder();
  const conversation = options.conversation || createConversation();
  const capabilitiesResolver =
    options.capabilitiesResolver ||
    ((input) => {
      const skillCapabilities = Array.isArray(input.skills) ? input.skills : [];
      const providerCapabilities = provider.capabilities();
      return [...providerCapabilities, ...skillCapabilities];
    });

  assertProvider(provider);

  async function run(input = {}) {
    assertCopilotInput(input);

    conversation.addMessage({ role: "user", content: input.message });

    const capabilities = capabilitiesResolver(input);
    const prompt = promptBuilder.buildPrompt({
      ...input,
      capabilities,
      history: conversation.listMessages()
    });

    const result = await provider.execute(prompt, {
      context: input.context || {},
      config: input.config || {}
    });

    conversation.addMessage({ role: "assistant", content: result.text });

    return {
      response: result.text,
      metadata: {
        ...(result.metadata || {}),
        capabilities,
        prompt
      },
      usage: result.usage || null,
      conversation: conversation.listMessages()
    };
  }

  return {
    run,
    conversation
  };
}

module.exports = {
  createCopilot
};