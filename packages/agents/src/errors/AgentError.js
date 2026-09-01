class AgentError extends Error { constructor(message, options = {}) { super(message); this.name = this.constructor.name; this.code = options.code || "AGENT_ERROR"; this.details = options.details; if (options.cause) this.cause = options.cause; } }
module.exports = { AgentError };
