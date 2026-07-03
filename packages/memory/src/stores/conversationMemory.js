function createConversationMemoryStore(memoryEngine) {
  return {
    remember(input, context) {
      return memoryEngine.remember(
        { ...input, scope: "conversation", type: input.type || "conversation" },
        context
      );
    },
    list(context) {
      return memoryEngine.listMemory({ ...context, scope: "conversation" });
    }
  };
}

module.exports = {
  createConversationMemoryStore
};