const { AIError } = require("../errors/AIError");

function assertCopilotInput(input) {
  if (!input || typeof input !== "object") {
    throw new AIError("Copilot input must be an object", "INVALID_COPILOT_INPUT");
  }

  if (typeof input.message !== "string" || input.message.trim().length === 0) {
    throw new AIError("Copilot message must be a non-empty string", "INVALID_COPILOT_MESSAGE");
  }
}

module.exports = {
  assertCopilotInput
};