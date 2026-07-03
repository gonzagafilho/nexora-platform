function createInMemorySkillAdapter(initialHandlers = {}) {
  const handlers = new Map(Object.entries(initialHandlers));

  return {
    async execute(skillName, payload, context) {
      const handler = handlers.get(skillName);
      if (!handler) {
        return {
          ok: true,
          handledBy: "in-memory-fallback",
          skillName,
          payload,
          context
        };
      }

      return handler(payload, context);
    },
    async canExecute(skillName) {
      return handlers.has(skillName);
    },
    listCapabilities() {
      return Array.from(handlers.keys());
    },
    register(skillName, handler) {
      handlers.set(skillName, handler);
    }
  };
}

module.exports = {
  createInMemorySkillAdapter
};