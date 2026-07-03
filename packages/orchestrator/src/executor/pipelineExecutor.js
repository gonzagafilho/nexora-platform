const { createPipelineStore } = require("../pipeline/pipelineStore");
const { createOrchestratorEventEmitter } = require("../events/orchestratorEventEmitter");
const { ORCHESTRATOR_EVENTS } = require("../events/orchestratorEvents");
const { PIPELINE_STATUS } = require("../pipeline/pipelineStatus");
const { runSequential } = require("../strategies/sequentialStrategy");
const { runParallel } = require("../strategies/parallelStrategy");
const { executeStep } = require("./stepExecutor");
const { applyOrchestratorPolicy, applyStepPolicy } = require("../policies/orchestratorPolicy");

function createPipelineExecutor(options = {}) {
  const pipelineStore = options.pipelineStore || createPipelineStore();
  const eventEmitter = options.eventEmitter || createOrchestratorEventEmitter();

  async function executePlan(plan, context) {
    const startedAt = Date.now();

    const pipeline = {
      id: plan.id,
      intent: plan.intent,
      tenantId: plan.tenantId,
      userId: plan.userId,
      projectKey: plan.projectKey,
      appId: plan.appId,
      status: PIPELINE_STATUS.CREATED,
      createdAt: plan.createdAt,
      steps: plan.steps,
      events: []
    };

    pipelineStore.save(pipeline);
    eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_CREATED, { pipelineId: pipeline.id });
    eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_STARTED, { pipelineId: pipeline.id });
    pipelineStore.update(pipeline.id, { status: PIPELINE_STATUS.RUNNING });

    try {
      applyOrchestratorPolicy(plan, context);
    } catch (error) {
      const failed = {
        ok: false,
        pipelineId: pipeline.id,
        status: PIPELINE_STATUS.FAILED,
        durationMs: Date.now() - startedAt,
        steps: [],
        error: {
          code: error.code,
          message: error.message
        },
        metadata: {}
      };

      if (error.code === "CONFIRMATION_REQUIRED") {
        eventEmitter.emit(ORCHESTRATOR_EVENTS.CONFIRMATION_REQUIRED, { pipelineId: pipeline.id });
      }
      if (error.code === "PERMISSION_DENIED") {
        eventEmitter.emit(ORCHESTRATOR_EVENTS.PERMISSION_DENIED, { pipelineId: pipeline.id });
      }

      eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_FAILED, {
        pipelineId: pipeline.id,
        code: error.code
      });
      pipelineStore.update(pipeline.id, { status: PIPELINE_STATUS.FAILED });
      return failed;
    }

    const runStep = async (step) => {
      eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_STARTED, {
        pipelineId: pipeline.id,
        stepId: step.id,
        tool: step.tool
      });

      try {
        applyStepPolicy(step, context);
      } catch (error) {
        if (error.code && error.code.includes("CONFIRMATION")) {
          eventEmitter.emit(ORCHESTRATOR_EVENTS.CONFIRMATION_REQUIRED, {
            pipelineId: pipeline.id,
            stepId: step.id
          });
        }

        eventEmitter.emit(ORCHESTRATOR_EVENTS.PERMISSION_DENIED, {
          pipelineId: pipeline.id,
          stepId: step.id,
          code: error.code
        });

        const deniedResult = {
          ...step,
          status: "failed",
          result: null,
          error: {
            code: error.code,
            message: error.message
          },
          durationMs: 0
        };

        eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_FAILED, {
          pipelineId: pipeline.id,
          stepId: step.id,
          code: error.code
        });

        return deniedResult;
      }

      const stepResult = await executeStep(step, context, {
        onRetry: (error, attempt) => {
          eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_RETRIED, {
            pipelineId: pipeline.id,
            stepId: step.id,
            attempt,
            code: error.code || "STEP_RETRY"
          });
        }
      });

      if (stepResult.status === "completed") {
        eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_COMPLETED, {
          pipelineId: pipeline.id,
          stepId: step.id,
          durationMs: stepResult.durationMs
        });
      } else {
        eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_FAILED, {
          pipelineId: pipeline.id,
          stepId: step.id,
          code: stepResult.error && stepResult.error.code
        });
        if (stepResult.rollback && stepResult.rollback.rolledBack) {
          eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_ROLLED_BACK, {
            pipelineId: pipeline.id,
            stepId: step.id
          });
        }
      }

      return stepResult;
    };

    const strategy = plan.steps.some((step) => step.strategy === "parallel") ? "parallel" : "sequential";
    const stepResults = strategy === "parallel"
      ? await runParallel(plan.steps, runStep)
      : await runSequential(plan.steps, runStep);

    const hasFailedStep = stepResults.some((step) => step.status === "failed");
    const status = hasFailedStep ? PIPELINE_STATUS.FAILED : PIPELINE_STATUS.COMPLETED;

    pipelineStore.update(pipeline.id, {
      status,
      steps: stepResults
    });

    if (status === PIPELINE_STATUS.COMPLETED) {
      eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_COMPLETED, { pipelineId: pipeline.id });
    } else {
      eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_FAILED, { pipelineId: pipeline.id });
    }

    return {
      ok: status === PIPELINE_STATUS.COMPLETED,
      pipelineId: pipeline.id,
      status,
      durationMs: Date.now() - startedAt,
      steps: stepResults,
      error: hasFailedStep ? { code: "PIPELINE_FAILED", message: "One or more steps failed" } : null,
      metadata: {
        strategy,
        stepCount: stepResults.length
      }
    };
  }

  return {
    executePlan,
    pipelineStore,
    eventEmitter
  };
}

module.exports = {
  createPipelineExecutor
};