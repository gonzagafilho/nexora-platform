const { createAssistant } = require("./assistant/assistantEngine");
const { createCopilot } = require("./copilot/copilotEngine");
const { createProviderRegistry } = require("./providers/providerRegistry");
const { createPromptBuilder } = require("./copilot/promptBuilder");
const { createConversation } = require("./copilot/conversation");
const { createMemoryBridge } = require("./memory/memoryBridge");
const { createIntentDetector } = require("./planner/intentDetector");
const { createResponsePlanner } = require("./planner/responsePlanner");
const { AI_CORE_VERSION } = require("./config/version");

module.exports = {
  createAssistant,
  createCopilot,
  createProviderRegistry,
  createPromptBuilder,
  createConversation,
  createMemoryBridge,
  createIntentDetector,
  createResponsePlanner,
  AI_CORE_VERSION
};
