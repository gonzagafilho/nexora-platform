const { buildPlanGraph, topologicalSort, getExecutionLevels } = require("../planner/planGraph");
const { createExecutionJournal } = require("./executionJournal");

function createPipeline(plan, options = {}) {
  const journal = options.journal || createExecutionJournal();

  return {
    id: plan.id,
    intent: plan.intent,
    tenantId: plan.tenantId,
    userId: plan.userId,
    projectKey: plan.projectKey,
    appId: plan.appId,
    status: plan.status,
    createdAt: plan.createdAt,
    steps: plan.steps,
    events: Array.isArray(plan.events) ? [...plan.events] : [],
    journal,
    toGraph() {
      return buildPlanGraph({ steps: this.steps });
    },
    toExecutionOrder() {
      return topologicalSort({ steps: this.steps });
    },
    toExecutionLevels() {
      return getExecutionLevels({ steps: this.steps });
    }
  };
}

module.exports = {
  createPipeline
};