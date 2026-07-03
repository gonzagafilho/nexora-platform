const { OrchestratorError } = require("./OrchestratorError");

class PipelineExecutionError extends OrchestratorError {
  constructor(message, code = "PIPELINE_EXECUTION_ERROR", details = {}) {
    super(message, code, details);
    this.name = "PipelineExecutionError";
  }
}

module.exports = {
  PipelineExecutionError
};