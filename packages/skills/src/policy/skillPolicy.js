const { SkillPermissionError } = require("../errors/SkillPermissionError");
const {
  hasRequiredPermissions,
  hasEnabledModule,
  isAllowedRole
} = require("./permissionChecker");

function validateSkillPolicy(skill, payload = {}, context = {}) {
  if (!context.tenantId) {
    throw new SkillPermissionError("tenantId is required", "MISSING_TENANT_ID");
  }

  if (!isAllowedRole(context.role)) {
    throw new SkillPermissionError("Invalid role", "INVALID_ROLE", { role: context.role });
  }

  if (skill.enabled === false) {
    throw new SkillPermissionError("Skill disabled", "SKILL_DISABLED", { skill: skill.name });
  }

  if (Array.isArray(skill.permissions) && skill.permissions.length > 0 && !context.userId) {
    throw new SkillPermissionError("userId is required for this skill", "MISSING_USER_ID");
  }

  if (!hasRequiredPermissions(skill.permissions || [], context.permissions || [])) {
    throw new SkillPermissionError("Permission denied", "PERMISSION_DENIED", { skill: skill.name });
  }

  if (!hasEnabledModule(skill.name, context.enabledModules || [])) {
    throw new SkillPermissionError("Module disabled", "MODULE_DISABLED", { skill: skill.name });
  }

  if (skill.confirmationRequired === true) {
    const confirmed = Array.isArray(context.confirmedSkills) && context.confirmedSkills.includes(skill.name);
    if (!confirmed) {
      throw new SkillPermissionError("Confirmation required", "CONFIRMATION_REQUIRED", { skill: skill.name });
    }
  }

  if (payload && payload.tenantId && payload.tenantId !== context.tenantId) {
    throw new SkillPermissionError("Cross tenant blocked", "CROSS_TENANT_BLOCKED");
  }

  return true;
}

module.exports = {
  validateSkillPolicy
};