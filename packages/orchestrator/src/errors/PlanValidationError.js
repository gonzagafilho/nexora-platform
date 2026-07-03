const { OrchestratorError } = require("./OrchestratorError");

class PlanValidationError extends OrchestratorError {
  constructor(message, code = "PLAN_VALIDATION_ERROR", details = {}) {
    super(message, code, details);
    this.name = "PlanValidationError";
  }
}

module.exports = {
  PlanValidationError
};