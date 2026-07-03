const { validatePlan: validatePlanContract } = require("../contracts/planContract");

function validatePlan(plan) {
  return validatePlanContract(plan);
}

module.exports = {
  validatePlan
};