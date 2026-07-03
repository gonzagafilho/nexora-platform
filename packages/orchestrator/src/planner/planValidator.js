const { validatePlan: validatePlanContract } = require("../contracts/planContract");
const { PlanValidationError } = require("../errors/PlanValidationError");
const { detectCycle } = require("./planGraph");

function validatePlan(plan) {
  validatePlanContract(plan);

  if (detectCycle(plan)) {
    throw new PlanValidationError("Plan contains dependency cycle", "PLAN_CYCLE_DETECTED");
  }

  return true;
}

module.exports = {
  validatePlan
};