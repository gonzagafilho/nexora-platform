const { validateAssistantInput, validateAssistantOutput } = require("./assistantValidator");
const { buildAssistantContext } = require("./assistantContext");
const { buildAssistantResponse } = require("./assistantResponse");
const { resolveAssistantCapabilities } = require("./assistantCapabilities");
const { createMemoryBridge } = require("../memory/memoryBridge");
const { createIntentDetector } = require("../planner/intentDetector");
const { createContextResolver } = require("../planner/contextResolver");
const { createResponsePlanner } = require("../planner/responsePlanner");
const { createCopilot } = require("../copilot/copilotEngine");
const { assertProvider } = require("../contracts/providerContract");
const { DEFAULT_CONFIG } = require("../config/defaults");

function createAssistant(options = {}) {
  const memoryBridge = options.memoryBridge || createMemoryBridge();
  const intentDetector = options.intentDetector || createIntentDetector();
  const contextResolver = options.contextResolver || createContextResolver({ intentDetector });
  const responsePlanner = options.responsePlanner || createResponsePlanner();
  const provider = options.provider;

  assertProvider(provider);

  const copilot = createCopilot({
    provider,
    promptBuilder: options.promptBuilder,
    conversation: options.conversation,
    capabilitiesResolver: resolveAssistantCapabilities
  });

  async function run(input = {}) {
    validateAssistantInput(input);

    const memoryContext = await memoryBridge.resolveContext({
      context: input.context,
      project: input.project,
      userId: input.context && input.context.userId
    });

    const memory = await memoryBridge.resolveMemory({
      context: input.context,
      project: input.project,
      userId: input.context && input.context.userId
    });

    const resolvedContext = await contextResolver.resolveContext({
      context: input.context,
      message: input.message,
      memoryContext,
      project: input.project,
      skills: input.skills
    });

    const plan = responsePlanner.createPlan({
      intent: resolvedContext.intent,
      skills: input.skills,
      project: input.project
    });

    const assistantContext = buildAssistantContext({
      context: resolvedContext,
      project: input.project,
      skills: input.skills,
      memory
    });

    const result = await copilot.run({
      message: input.message,
      context: assistantContext,
      project: input.project,
      skills: input.skills,
      config: {
        ...DEFAULT_CONFIG,
        ...(input.config || {})
      }
    });

    await memoryBridge.saveMemory({
      context: assistantContext,
      message: input.message,
      response: result.response,
      metadata: result.metadata
    });

    const output = buildAssistantResponse({
      response: result.response,
      metadata: {
        ...result.metadata,
        intent: resolvedContext.intent,
        confidence: resolvedContext.confidence
      },
      usage: result.usage,
      plan
    });

    return validateAssistantOutput(output);
  }

  return {
    run
  };
}

module.exports = {
  createAssistant
};