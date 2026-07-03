const ORCHESTRATOR_EVENTS = {
  PIPELINE_CREATED: "PipelineCreated",
  PIPELINE_STARTED: "PipelineStarted",
  PIPELINE_COMPLETED: "PipelineCompleted",
  PIPELINE_FAILED: "PipelineFailed",
  PIPELINE_CANCELLED: "PipelineCancelled",
  STEP_STARTED: "StepStarted",
  STEP_COMPLETED: "StepCompleted",
  STEP_FAILED: "StepFailed",
  STEP_RETRIED: "StepRetried",
  STEP_ROLLED_BACK: "StepRolledBack",
  CONFIRMATION_REQUIRED: "ConfirmationRequired",
  PERMISSION_DENIED: "PermissionDenied"
};

module.exports = {
  ORCHESTRATOR_EVENTS
};