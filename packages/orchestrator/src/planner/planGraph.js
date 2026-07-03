const { PlanValidationError } = require("../errors/PlanValidationError");

function getPlanSteps(plan) {
  if (!plan || !Array.isArray(plan.steps)) {
    throw new PlanValidationError("Plan steps must be an array", "INVALID_PLAN_STEPS");
  }
  return plan.steps;
}

function buildPlanGraph(plan) {
  const steps = getPlanSteps(plan);
  const nodes = new Map();
  const adjacency = new Map();
  const inDegree = new Map();
  const edges = [];

  steps.forEach((step) => {
    if (nodes.has(step.id)) {
      throw new PlanValidationError("Duplicate step id", "DUPLICATE_STEP_ID", { stepId: step.id });
    }

    nodes.set(step.id, step);
    adjacency.set(step.id, []);
    inDegree.set(step.id, 0);
  });

  steps.forEach((step) => {
    const dependencies = Array.isArray(step.dependsOn) ? step.dependsOn : [];
    dependencies.forEach((dependencyId) => {
      if (!nodes.has(dependencyId)) {
        throw new PlanValidationError("dependsOn references unknown step", "INVALID_STEP_DEPENDENCY", {
          stepId: step.id,
          dependencyId
        });
      }

      adjacency.get(dependencyId).push(step.id);
      inDegree.set(step.id, inDegree.get(step.id) + 1);
      edges.push({ from: dependencyId, to: step.id });
    });
  });

  return {
    nodes,
    edges,
    adjacency,
    inDegree
  };
}

function topologicalSort(plan) {
  const graph = buildPlanGraph(plan);
  const nodes = Array.from(graph.nodes.values());
  const indexById = new Map(nodes.map((step, index) => [step.id, index]));
  const inDegree = new Map(graph.inDegree);
  let queue = nodes.filter((step) => inDegree.get(step.id) === 0);
  const sorted = [];

  while (queue.length > 0) {
    queue.sort((a, b) => indexById.get(a.id) - indexById.get(b.id));
    const current = queue.shift();
    sorted.push(current);

    for (const nextId of graph.adjacency.get(current.id)) {
      const remaining = inDegree.get(nextId) - 1;
      inDegree.set(nextId, remaining);
      if (remaining === 0) {
        queue.push(graph.nodes.get(nextId));
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new PlanValidationError("Plan contains dependency cycle", "PLAN_CYCLE_DETECTED");
  }

  return sorted;
}

function detectCycle(plan) {
  try {
    topologicalSort(plan);
    return false;
  } catch (error) {
    if (error && error.code === "PLAN_CYCLE_DETECTED") {
      return true;
    }
    throw error;
  }
}

function getExecutionLevels(plan) {
  const graph = buildPlanGraph(plan);
  const nodes = Array.from(graph.nodes.values());
  const indexById = new Map(nodes.map((step, index) => [step.id, index]));
  const inDegree = new Map(graph.inDegree);
  let ready = nodes.filter((step) => inDegree.get(step.id) === 0);
  const levels = [];
  let processed = 0;

  while (ready.length > 0) {
    ready.sort((a, b) => indexById.get(a.id) - indexById.get(b.id));
    const currentLevel = [...ready];
    levels.push(currentLevel);
    processed += currentLevel.length;

    const nextReady = [];
    for (const step of currentLevel) {
      for (const nextId of graph.adjacency.get(step.id)) {
        const remaining = inDegree.get(nextId) - 1;
        inDegree.set(nextId, remaining);
        if (remaining === 0) {
          nextReady.push(graph.nodes.get(nextId));
        }
      }
    }
    ready = nextReady;
  }

  if (processed !== nodes.length) {
    throw new PlanValidationError("Plan contains dependency cycle", "PLAN_CYCLE_DETECTED");
  }

  return levels;
}

module.exports = {
  buildPlanGraph,
  detectCycle,
  topologicalSort,
  getExecutionLevels
};