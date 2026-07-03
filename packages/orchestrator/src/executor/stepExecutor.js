const { executeWithRetry } = require("./retryPolicy");
const { executeWithTimeout } = require("./timeoutPolicy");
const { executeRollback } = require("./rollbackPolicy");
const { calculateDuration } = require("../utils/duration");

async function executeStep(step, context, options = {}) {
  const startedAt = Date.now();
  const tools = context.tools;

  const result = {
    ...step,
    startedAt,
    status: "running"
  };

  try {
    const data = await executeWithRetry(
      () => executeWithTimeout(() => tools.execute(step.tool, step.input || {}, context), step.timeoutMs),
      {
        retry: step.retry,
        onRetry: (error, attempt) => {
          if (typeof options.onRetry === "function") {
            options.onRetry(error, attempt);
          }
        }
      }
    );

    const finishedAt = Date.now();
    return {
      ...result,
      status: "completed",
      result: data,
      finishedAt,
      durationMs: calculateDuration(startedAt, finishedAt),
      error: null
    };
  } catch (error) {
    const rollback = await executeRollback(step, context, error);
    const finishedAt = Date.now();

    return {
      ...result,
      status: "failed",
      result: null,
      finishedAt,
      durationMs: calculateDuration(startedAt, finishedAt),
      error: {
        code: error.code || "STEP_FAILED",
        message: error.message
      },
      rollback
    };
  }
}

module.exports = {
  executeStep
};