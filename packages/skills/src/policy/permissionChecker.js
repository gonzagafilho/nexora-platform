const ALLOWED_ROLES = ["owner", "admin", "manager", "operator", "viewer"];

function hasRequiredPermissions(required = [], granted = []) {
  if (!Array.isArray(required) || required.length === 0) {
    return true;
  }

  const grantedSet = new Set(Array.isArray(granted) ? granted : []);
  return required.every((permission) => grantedSet.has(permission));
}

function hasEnabledModule(skillName, enabledModules = []) {
  if (!Array.isArray(enabledModules) || enabledModules.length === 0) {
    return true;
  }

  const category = String(skillName || "").split(".")[0];
  return enabledModules.includes(category);
}

function isAllowedRole(role) {
  if (!role) {
    return true;
  }
  return ALLOWED_ROLES.includes(role);
}

module.exports = {
  ALLOWED_ROLES,
  hasRequiredPermissions,
  hasEnabledModule,
  isAllowedRole
};