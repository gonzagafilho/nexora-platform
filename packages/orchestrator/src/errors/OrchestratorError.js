class OrchestratorError extends Error {
  constructor(message, code = "ORCHESTRATOR_ERROR", details = {}) {
    super(message);
    this.name = "OrchestratorError";
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  OrchestratorError
};