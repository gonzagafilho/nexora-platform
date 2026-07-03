const { normalizeContext } = require("../contracts/contextContract");

function buildAssistantContext(input = {}) {
  const context = normalizeContext(input.context || {});

  return {
    ...context,
    project: input.project || null,
    skills: Array.isArray(input.skills) ? input.skills : [],
    memory: input.memory || []
  };
}

module.exports = {
  buildAssistantContext
};