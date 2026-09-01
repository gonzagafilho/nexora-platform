const { AgentError } = require("./AgentError");
class AgentValidationError extends AgentError { constructor(message, details) { super(message, { code: "AGENT_VALIDATION_ERROR", details }); } }
module.exports = { AgentValidationError };
