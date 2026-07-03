const { SkillError } = require("./SkillError");

class SkillPermissionError extends SkillError {
  constructor(message, code = "SKILL_PERMISSION_DENIED", details = {}) {
    super(message, code, details);
    this.name = "SkillPermissionError";
  }
}

module.exports = {
  SkillPermissionError
};