const { PipelineExecutionError } = require("../errors/PipelineExecutionError");

function ensureConfirmationAllowed(plan, context) {
  if (!plan.confirmationRequired) {
    return true;
  }

  if (context.confirm === true) {
    return true;
  }

  throw new PipelineExecutionError("Confirmation required", "CONFIRMATION_REQUIRED", {
    planId: plan.id
  });
}

function ensureStepConfirmationAllowed(step, context) {
  if (!step.confirmationRequired) {
    return true;
  }

  if (context.confirm === true) {
    return true;
  }

  throw new PipelineExecutionError("Step confirmation required", "STEP_CONFIRMATION_REQUIRED", {
    stepId: step.id
  });
}

module.exports = {
  ensureConfirmationAllowed,
  ensureStepConfirmationAllowed
};