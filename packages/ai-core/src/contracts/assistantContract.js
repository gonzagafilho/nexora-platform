const { AIError } = require("../errors/AIError");

function assertAssistantInput(input) {
  if (!input || typeof input !== "object") {
    throw new AIError("Assistant input must be an object", "INVALID_ASSISTANT_INPUT");
  }

  if (typeof input.message !== "string" || input.message.trim().length === 0) {
    throw new AIError("Assistant message must be a non-empty string", "INVALID_ASSISTANT_MESSAGE");
  }
}

function assertAssistantOutput(output) {
  if (!output || typeof output !== "object") {
    throw new AIError("Assistant output must be an object", "INVALID_ASSISTANT_OUTPUT");
  }

  if (typeof output.response !== "string") {
    throw new AIError("Assistant response must be a string", "INVALID_ASSISTANT_RESPONSE");
  }
}

module.exports = {
  assertAssistantInput,
  assertAssistantOutput
};