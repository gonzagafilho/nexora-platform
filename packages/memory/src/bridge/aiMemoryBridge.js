const { createMemoryEngine } = require("../engine/memoryEngine");

function createAIMemoryBridge(options = {}) {
  const memoryEngine = options.memoryEngine || createMemoryEngine(options);

  return {
    async resolveContext(input = {}) {
      const context = {
        tenantId: input.tenantId,
        userId: input.userId,
        projectKey: input.projectKey,
        appId: input.appId
      };

      return memoryEngine.buildContext(
        {
          text: input.message || "",
          maxItems: input.maxItems || 6,
          maxChars: input.maxChars || 1600
        },
        context
      );
    },
    resolveMemory(query, context) {
      return memoryEngine.searchMemory(query, context);
    },
    saveMemory(record, context) {
      return memoryEngine.remember(record, context);
    }
  };
}

module.exports = {
  createAIMemoryBridge
};