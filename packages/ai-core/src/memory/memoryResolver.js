function createMemoryResolver(adapter = {}) {
  return {
    async resolveContext(input = {}) {
      if (typeof adapter.resolveContext === "function") {
        return adapter.resolveContext(input);
      }
      return {};
    },
    async resolveMemory(input = {}) {
      if (typeof adapter.resolveMemory === "function") {
        return adapter.resolveMemory(input);
      }
      return [];
    }
  };
}

module.exports = {
  createMemoryResolver
};