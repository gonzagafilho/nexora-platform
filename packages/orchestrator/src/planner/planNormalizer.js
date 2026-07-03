const { createId } = require("../utils/createId");
const { PIPELINE_STATUS } = require("../pipeline/pipelineStatus");
const { normalizeToolName } = require("../contracts/stepContract");

function normalizeStep(step, index) {
  return {
    id: step.id || createId(`step${index + 1}`),
    tool: normalizeToolName(step.tool),
    input: step.input || {},
    dependsOn: Array.isArray(step.dependsOn) ? step.dependsOn : [],
    strategy: step.strategy || "sequential",
    retry: step.retry !== undefined ? step.retry : 0,
    timeoutMs: step.timeoutMs,
    rollback: step.rollback || null,
    confirmationRequired: Boolean(step.confirmationRequired),
    status: step.status || "pending",
    result: step.result || null,
    error: step.error || null,
    startedAt: step.startedAt || null,
    finishedAt: step.finishedAt || null,
    durationMs: step.durationMs || null
  };
}

function normalizePlan(input = {}) {
  const steps = Array.isArray(input.steps) ? input.steps : [];

  return {
    id: input.id || createId("plan"),
    intent: input.intent || "default",
    tenantId: input.tenantId || null,
    userId: input.userId || null,
    projectKey: input.projectKey || null,
    appId: input.appId || null,
    confirmationRequired: Boolean(input.confirmationRequired),
    status: input.status || PIPELINE_STATUS.DRAFT,
    steps: steps.map(normalizeStep),
    metadata: input.metadata || {},
    createdAt: input.createdAt || new Date().toISOString()
  };
}

module.exports = {
  normalizePlan
};