const { PipelineExecutionError } = require("../errors/PipelineExecutionError");

async function executeWithTimeout(executor, timeoutMs) {
  if (!timeoutMs) {
    return executor();
  }

  return Promise.race([
    executor(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new PipelineExecutionError("Step timeout", "STEP_TIMEOUT"));
      }, timeoutMs);
    })
  ]);
}

module.exports = {
  executeWithTimeout
};