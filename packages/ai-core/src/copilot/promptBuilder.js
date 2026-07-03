function createPromptBuilder(options = {}) {
  const prefix = options.prefix || "NEXORA Copilot";

  function buildPrompt(input = {}) {
    const context = input.context || {};
    const capabilities = input.capabilities || [];
    const history = Array.isArray(input.history) ? input.history : [];

    return [
      `${prefix} assistant`,
      `Project: ${input.project || "n/a"}`,
      `Context: ${JSON.stringify(context)}`,
      `Capabilities: ${capabilities.join(", ") || "none"}`,
      `History: ${JSON.stringify(history)}`,
      `User: ${input.message || ""}`
    ].join("\n");
  }

  return {
    buildPrompt
  };
}

module.exports = {
  createPromptBuilder
};