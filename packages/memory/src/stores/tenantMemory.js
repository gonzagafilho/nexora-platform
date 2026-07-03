function createTenantMemoryStore(memoryEngine) {
  return {
    remember(input, context) {
      return memoryEngine.remember({ ...input, scope: "tenant", type: input.type || "tenant" }, context);
    },
    list(context) {
      return memoryEngine.listMemory({ ...context, scope: "tenant" });
    }
  };
}

module.exports = {
  createTenantMemoryStore
};