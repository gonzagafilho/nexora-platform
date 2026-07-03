const { intentToPlan } = require("./intentToPlan");
const { normalizePlan } = require("./planNormalizer");
const { validatePlan } = require("./planValidator");

function createExecutionPlanner() {
  function createPlan(input = {}) {
    const steps = Array.isArray(input.steps) && input.steps.length > 0 ? input.steps : intentToPlan(input);

    const plan = normalizePlan({
      intent: input.intent,
      tenantId: input.context && input.context.tenantId,
      userId: input.context && input.context.userId,
      projectKey: input.context && input.context.projectKey,
      appId: input.context && input.context.appId,
      confirmationRequired: input.confirmationRequired,
      steps,
      metadata: {
        ...(input.metadata || {}),
        message: input.message || null
      }
    });

    validatePlan(plan);
    return plan;
  }

  return {
    createPlan
  };
}

module.exports = {
  createExecutionPlanner
};