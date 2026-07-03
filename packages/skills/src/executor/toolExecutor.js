const { createSkillExecutor } = require("./skillExecutor");

function createToolExecutor(options = {}) {
  return createSkillExecutor(options);
}

module.exports = {
  createToolExecutor
};