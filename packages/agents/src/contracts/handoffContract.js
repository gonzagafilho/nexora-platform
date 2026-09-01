const { AgentValidationError } = require("../errors/AgentValidationError");
function validateHandoff(value) { if (!value || !value.from || !value.to) throw new AgentValidationError("Handoff from and to are required"); return value; }
module.exports = { validateHandoff };
