const { AgentValidationError } = require("../errors/AgentValidationError");
function validateCapability(value) { if (!value || typeof value !== "object") throw new AgentValidationError("Capability must be an object"); if (!value.id || !value.name) throw new AgentValidationError("Capability id and name are required"); if (value.intents != null && !Array.isArray(value.intents)) throw new AgentValidationError("Capability intents must be an array"); return value; }
module.exports = { validateCapability };
