function createUserMemoryStore(memoryEngine) {
  return {
    remember(input, context) {
      return memoryEngine.remember({ ...input, scope: "user", type: input.type || "user" }, context);
    },
    list(context) {
      return memoryEngine.listMemory({ ...context, scope: "user" });
    }
  };
}

module.exports = {
  createUserMemoryStore
};