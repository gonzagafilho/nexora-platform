const { createExecutionPlanner } = require("../planner/executionPlanner");
const { createPipelineExecutor } = require("../executor/pipelineExecutor");
const { createRuntimeContext } = require("../contracts/runtimeContextContract");
const { createPipeline } = require("./pipelineFactory");

function createOrchestrator(options = {}) {
  const planner = options.planner || createExecutionPlanner();
  const executor = options.executor || createPipelineExecutor(options);

  async function execute(input = {}) {
    const context = createRuntimeContext(input.context || {});
    const plan = planner.createPlan({
      intent: input.intent,
      message: input.message,
      steps: input.steps,
      context,
      confirmationRequired: input.confirmationRequired,
      metadata: input.metadata
    });

    return executor.executePlan(plan, context);
  }

  return {
    planner,
    executor,
    execute
  };
}

module.exports = {
  createOrchestrator,
  createPipeline
};