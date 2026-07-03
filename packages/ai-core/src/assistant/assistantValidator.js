const {
  assertAssistantInput,
  assertAssistantOutput
} = require("../contracts/assistantContract");

function validateAssistantInput(input) {
  assertAssistantInput(input);
  return input;
}

function validateAssistantOutput(output) {
  assertAssistantOutput(output);
  return output;
}

module.exports = {
  validateAssistantInput,
  validateAssistantOutput
};