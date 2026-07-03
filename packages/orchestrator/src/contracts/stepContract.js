const { PlanValidationError } = require("../errors/PlanValidationError");

const ALLOWED_STRATEGIES = ["sequential", "parallel"];

function normalizeToolName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

function validateStep(step, allStepIds = new Set()) {
  if (!step || typeof step !== "object") {
    throw new PlanValidationError("Step must be an object", "INVALID_STEP");
  }

  if (!step.tool) {
    throw new PlanValidationError("Step tool is required", "MISSING_STEP_TOOL", { stepId: step.id });
  }

  if (!ALLOWED_STRATEGIES.includes(step.strategy || "sequential")) {
    throw new PlanValidationError("Invalid step strategy", "INVALID_STEP_STRATEGY", { stepId: step.id });
  }

  if (step.retry !== undefined && step.retry < 0) {
    throw new PlanValidationError("retry must be >= 0", "INVALID_STEP_RETRY", { stepId: step.id });
  }

  if (step.timeoutMs !== undefined && step.timeoutMs <= 0) {
    throw new PlanValidationError("timeoutMs must be > 0", "INVALID_STEP_TIMEOUT", { stepId: step.id });
  }

  const dependsOn = Array.isArray(step.dependsOn) ? step.dependsOn : [];
  dependsOn.forEach((dependencyId) => {
    if (!allStepIds.has(dependencyId)) {
      throw new PlanValidationError("dependsOn references unknown step", "INVALID_STEP_DEPENDENCY", {
        stepId: step.id,
        dependencyId
      });
    }
  });

  return true;
}

module.exports = {
  ALLOWED_STRATEGIES,
  normalizeToolName,
  validateStep
};