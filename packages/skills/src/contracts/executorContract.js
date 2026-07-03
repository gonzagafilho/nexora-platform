const { SkillValidationError } = require("../errors/SkillValidationError");

function validateExecutionContext(context = {}) {
  if (!context || typeof context !== "object") {
    throw new SkillValidationError("Execution context must be an object", "INVALID_EXECUTION_CONTEXT");
  }

  return true;
}

function validateExecutionResult(result) {
  if (!result || typeof result !== "object") {
    throw new SkillValidationError("Execution result must be an object", "INVALID_EXECUTION_RESULT");
  }

  if (typeof result.ok !== "boolean") {
    throw new SkillValidationError("Execution result ok must be boolean", "INVALID_EXECUTION_RESULT_OK");
  }

  return true;
}

module.exports = {
  validateExecutionContext,
  validateExecutionResult
};