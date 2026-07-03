function createNoopSkillAdapter() {
  return {
    async execute(skillName, payload, context) {
      return {
        ok: true,
        handledBy: "noop",
        skillName,
        payload,
        context
      };
    },
    async canExecute() {
      return false;
    },
    listCapabilities() {
      return [];
    }
  };
}

module.exports = {
  createNoopSkillAdapter
};