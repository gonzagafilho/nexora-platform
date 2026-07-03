function buildAssistantResponse(input = {}) {
  return {
    response: input.response || "",
    metadata: input.metadata || {},
    usage: input.usage || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    },
    plan: input.plan || null
  };
}

module.exports = {
  buildAssistantResponse
};