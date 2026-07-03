const { PlanValidationError } = require("../errors/PlanValidationError");

function validateToolRuntime(tools) {
  if (!tools || typeof tools !== "object") {
    throw new PlanValidationError("Runtime tools object is required", "INVALID_TOOLS_RUNTIME");
  }

  if (typeof tools.execute !== "function") {
    throw new PlanValidationError("tools.execute is required", "INVALID_TOOLS_EXECUTE");
  }

  if (typeof tools.listTools !== "function") {
    throw new PlanValidationError("tools.listTools is required", "INVALID_TOOLS_LIST");
  }

  return true;
}

module.exports = {
  validateToolRuntime
};