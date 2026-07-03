const { PipelineExecutionError } = require("../errors/PipelineExecutionError");

function isMutableTool(toolName) {
  return /(create|update|delete|start|send|generate|export|whatsapp|email|push)/.test(toolName);
}

function requiredPermissionForTool(toolName) {
  const category = String(toolName || "").split(".")[0];
  if (/(list|details|get|status|find)/.test(toolName)) {
    return `${category}:read`;
  }
  return `${category}:write`;
}

function ensurePermissionsAllowed(step, context) {
  const toolName = step.tool;
  const requiredPermission = requiredPermissionForTool(toolName);
  const permissions = Array.isArray(context.permissions) ? context.permissions : [];

  if (!permissions.includes(requiredPermission)) {
    throw new PipelineExecutionError("Permission denied", "PERMISSION_DENIED", {
      stepId: step.id,
      tool: toolName,
      requiredPermission
    });
  }

  const enabledModules = Array.isArray(context.enabledModules) ? context.enabledModules : [];
  const category = toolName.split(".")[0];
  if (enabledModules.length > 0 && !enabledModules.includes(category)) {
    throw new PipelineExecutionError("Module disabled", "MODULE_DISABLED", {
      stepId: step.id,
      tool: toolName,
      category
    });
  }

  if (context.role === "viewer" && isMutableTool(toolName)) {
    throw new PipelineExecutionError("Viewer cannot execute mutable tools", "VIEWER_MUTATION_BLOCKED", {
      stepId: step.id,
      tool: toolName
    });
  }

  return true;
}

module.exports = {
  isMutableTool,
  requiredPermissionForTool,
  ensurePermissionsAllowed
};