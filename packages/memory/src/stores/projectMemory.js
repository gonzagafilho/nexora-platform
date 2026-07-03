function createProjectMemoryStore(memoryEngine) {
  return {
    remember(input, context) {
      return memoryEngine.remember({ ...input, scope: "project", type: input.type || "project" }, context);
    },
    list(context) {
      return memoryEngine.listMemory({ ...context, scope: "project" });
    }
  };
}

module.exports = {
  createProjectMemoryStore
};