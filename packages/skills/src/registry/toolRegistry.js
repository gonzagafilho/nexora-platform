const { createSkillRegistry } = require("./skillRegistry");

function createToolRegistry(options = {}) {
  return createSkillRegistry(options);
}

module.exports = {
  createToolRegistry
};