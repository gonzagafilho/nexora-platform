const { PipelineExecutionError } = require("../errors/PipelineExecutionError");
const { ensureConfirmationAllowed, ensureStepConfirmationAllowed } = require("./confirmationPolicy");
const { ensurePermissionsAllowed } = require("./permissionPolicy");

function applyOrchestratorPolicy(plan, context) {
  if (!context.tenantId) {
    throw new PipelineExecutionError("tenantId is required", "MISSING_TENANT_ID");
  }

  if (plan.tenantId !== context.tenantId) {
    throw new PipelineExecutionError("Cross tenant blocked", "CROSS_TENANT_BLOCKED");
  }

  ensureConfirmationAllowed(plan, context);
  return true;
}

function applyStepPolicy(step, context) {
  ensureStepConfirmationAllowed(step, context);
  ensurePermissionsAllowed(step, context);
  return true;
}

module.exports = {
  applyOrchestratorPolicy,
  applyStepPolicy
};