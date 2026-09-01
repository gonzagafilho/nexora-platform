const { AgentError } = require("./AgentError");
class AgentExecutionError extends AgentError { constructor(message, options = {}) { super(message, { ...options, code: options.code || "AGENT_EXECUTION_ERROR" }); } }
module.exports = { AgentExecutionError };
