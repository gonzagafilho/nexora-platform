const { SkillError } = require("./SkillError");

class SkillValidationError extends SkillError {
  constructor(message, code = "SKILL_VALIDATION_ERROR", details = {}) {
    super(message, code, details);
    this.name = "SkillValidationError";
  }
}

module.exports = {
  SkillValidationError
};