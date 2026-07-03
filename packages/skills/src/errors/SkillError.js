class SkillError extends Error {
  constructor(message, code = "SKILL_ERROR", details = {}) {
    super(message);
    this.name = "SkillError";
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  SkillError
};