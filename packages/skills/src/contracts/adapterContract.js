const { SkillValidationError } = require("../errors/SkillValidationError");

function validateSkillAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new SkillValidationError("Adapter must be an object", "INVALID_SKILL_ADAPTER");
  }

  const methods = ["execute", "canExecute", "listCapabilities"];
  methods.forEach((method) => {
    if (typeof adapter[method] !== "function") {
      throw new SkillValidationError("Invalid skill adapter method", "INVALID_SKILL_ADAPTER_METHOD", {
        method
      });
    }
  });

  return true;
}

module.exports = {
  validateSkillAdapter
};