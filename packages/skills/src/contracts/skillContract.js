const { SkillValidationError } = require("../errors/SkillValidationError");
const { normalizeSkillName } = require("../utils/normalizeSkillName");

function validateSkillDefinition(skill) {
  if (!skill || typeof skill !== "object") {
    throw new SkillValidationError("Skill definition must be an object", "INVALID_SKILL_DEFINITION");
  }

  const requiredFields = ["name", "description", "version", "category", "execute"];
  requiredFields.forEach((field) => {
    if (skill[field] === undefined || skill[field] === null || skill[field] === "") {
      throw new SkillValidationError("Missing required skill field", "MISSING_SKILL_FIELD", { field });
    }
  });

  const normalizedName = normalizeSkillName(skill.name);
  if (!/^[a-z0-9]+\.[a-z0-9]+$/.test(normalizedName)) {
    throw new SkillValidationError("Skill name must follow category.action", "INVALID_SKILL_NAME");
  }

  if (typeof skill.execute !== "function") {
    throw new SkillValidationError("Skill execute must be a function", "INVALID_SKILL_EXECUTOR");
  }

  if (skill.permissions && !Array.isArray(skill.permissions)) {
    throw new SkillValidationError("permissions must be an array", "INVALID_SKILL_PERMISSIONS");
  }

  return true;
}

module.exports = {
  validateSkillDefinition
};