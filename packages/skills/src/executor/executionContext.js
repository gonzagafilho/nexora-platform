function createExecutionContext(context = {}) {
  return {
    tenantId: context.tenantId || null,
    userId: context.userId || null,
    role: context.role || "viewer",
    permissions: Array.isArray(context.permissions) ? context.permissions : [],
    enabledModules: Array.isArray(context.enabledModules) ? context.enabledModules : [],
    confirmedSkills: Array.isArray(context.confirmedSkills) ? context.confirmedSkills : [],
    actions: context.actions || {},
    metadata: context.metadata || {}
  };
}

module.exports = {
  createExecutionContext
};