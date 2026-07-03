const { createMemoryResolver } = require("./memoryResolver");

function createMemoryBridge(adapter = {}) {
  const resolver = createMemoryResolver(adapter);

  return {
    resolveContext: resolver.resolveContext,
    resolveMemory: resolver.resolveMemory,
    async saveMemory(input = {}) {
      if (typeof adapter.saveMemory === "function") {
        return adapter.saveMemory(input);
      }
      return { saved: false, reason: "saveMemory adapter not configured" };
    }
  };
}

module.exports = {
  createMemoryBridge
};