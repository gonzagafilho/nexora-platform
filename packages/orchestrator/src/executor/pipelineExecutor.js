const { createPipelineStore } = require("../pipeline/pipelineStore");
const { createOrchestratorEventEmitter } = require("../events/orchestratorEventEmitter");
const { ORCHESTRATOR_EVENTS } = require("../events/orchestratorEvents");
const { PIPELINE_STATUS } = require("../pipeline/pipelineStatus");
const { createPipeline } = require("../pipeline/pipelineFactory");
const { createExecutionJournal } = require("../pipeline/executionJournal");
const { runSequential } = require("../strategies/sequentialStrategy");
const { runParallel } = require("../strategies/parallelStrategy");
const { executeStep } = require("./stepExecutor");
const { applyOrchestratorPolicy, applyStepPolicy } = require("../policies/orchestratorPolicy");

function createPipelineExecutor(options = {}) {
  const pipelineStore = options.pipelineStore || createPipelineStore();
  const eventEmitter = options.eventEmitter || createOrchestratorEventEmitter();

  async function executePlan(plan, context) {
    const startedAt = Date.now();
    const journal = createExecutionJournal();
    const pipeline = createPipeline(
      {
        ...plan,
        status: PIPELINE_STATUS.CREATED,
        events: []
      },
      { journal }
    );

    pipelineStore.save(pipeline);
    eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_CREATED, { pipelineId: pipeline.id });
    eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_STARTED, { pipelineId: pipeline.id });
    journal.info("Pipeline Started", { pipelineId: pipeline.id, intent: pipeline.intent });
    pipelineStore.update(pipeline.id, { status: PIPELINE_STATUS.RUNNING });

    try {
      applyOrchestratorPolicy(plan, context);
    } catch (error) {
      if (error.code === "CONFIRMATION_REQUIRED") {
        journal.warn("Confirmation Required", { pipelineId: pipeline.id, code: error.code });
      }
      if (error.code === "PERMISSION_DENIED") {
        journal.warn("Permission Denied", { pipelineId: pipeline.id, code: error.code });
      }

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
        metadata: {},
        journal: journal.list()
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
      journal.error("Pipeline Failed", {
        pipelineId: pipeline.id,
        code: error.code,
        message: error.message
      });
      pipelineStore.update(pipeline.id, { status: PIPELINE_STATUS.FAILED, journal });
      return failed;
    }

    const runStep = async (step) => {
      eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_STARTED, {
        pipelineId: pipeline.id,
        stepId: step.id,
        tool: step.tool
      });
      journal.info("Step Started", {
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
          journal.warn("Confirmation Required", {
            pipelineId: pipeline.id,
            stepId: step.id,
            code: error.code
          });
        }

        eventEmitter.emit(ORCHESTRATOR_EVENTS.PERMISSION_DENIED, {
          pipelineId: pipeline.id,
          stepId: step.id,
          code: error.code
        });
        journal.warn("Permission Denied", {
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
        journal.error("Step Failed", {
          pipelineId: pipeline.id,
          stepId: step.id,
          code: error.code,
          message: error.message
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
          journal.warn("Step Retried", {
            pipelineId: pipeline.id,
            stepId: step.id,
            attempt,
            code: error.code || "STEP_RETRY",
            message: error.message
          });
        }
      });

      if (stepResult.status === "completed") {
        eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_COMPLETED, {
          pipelineId: pipeline.id,
          stepId: step.id,
          durationMs: stepResult.durationMs
        });
        journal.info("Step Completed", {
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
        journal.error("Step Failed", {
          pipelineId: pipeline.id,
          stepId: step.id,
          code: stepResult.error && stepResult.error.code,
          message: stepResult.error && stepResult.error.message
        });
        if (stepResult.rollback && stepResult.rollback.rolledBack) {
          eventEmitter.emit(ORCHESTRATOR_EVENTS.STEP_ROLLED_BACK, {
            pipelineId: pipeline.id,
            stepId: step.id
          });
          journal.warn("Step Rolled Back", {
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
      steps: stepResults,
      journal
    });

    if (status === PIPELINE_STATUS.COMPLETED) {
      eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_COMPLETED, { pipelineId: pipeline.id });
      journal.info("Pipeline Completed", {
        pipelineId: pipeline.id,
        durationMs: Date.now() - startedAt,
        stepCount: stepResults.length
      });
    } else {
      eventEmitter.emit(ORCHESTRATOR_EVENTS.PIPELINE_FAILED, { pipelineId: pipeline.id });
      journal.error("Pipeline Failed", {
        pipelineId: pipeline.id,
        code: "PIPELINE_FAILED",
        stepCount: stepResults.length
      });
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
      },
      journal: journal.list()
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