const { AgentValidationError } = require("../errors/AgentValidationError");
const { validateCapability } = require("./capabilityContract");
function validateAgentDefinition(agent) { if (!agent || typeof agent !== "object") throw new AgentValidationError("Agent must be an object"); for (const field of ["id", "name", "domain"]) if (!agent[field] || typeof agent[field] !== "string") throw new AgentValidationError(`Agent ${field} is required`); if (!Array.isArray(agent.capabilities)) throw new AgentValidationError("Agent capabilities must be an array"); agent.capabilities.forEach(validateCapability); if (agent.execute != null && typeof agent.execute !== "function") throw new AgentValidationError("Agent execute must be a function"); return agent; }
module.exports = { validateAgentDefinition };
