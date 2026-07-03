const { PlanValidationError } = require("../errors/PlanValidationError");
const { validateStep } = require("./stepContract");

function validatePlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new PlanValidationError("Plan must be an object", "INVALID_PLAN");
  }

  if (!plan.tenantId) {
    throw new PlanValidationError("Plan tenantId is required", "MISSING_PLAN_TENANT");
  }

  if (!Array.isArray(plan.steps)) {
    throw new PlanValidationError("Plan steps must be an array", "INVALID_PLAN_STEPS");
  }

  const stepIds = new Set(plan.steps.map((step) => step.id));
  plan.steps.forEach((step) => validateStep(step, stepIds));

  if (plan.steps.length > 0 && !plan.userId) {
    throw new PlanValidationError("Plan userId is required for execution", "MISSING_PLAN_USER");
  }

  return true;
}

module.exports = {
  validatePlan
};