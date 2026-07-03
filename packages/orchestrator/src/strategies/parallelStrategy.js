const { getExecutionLevels } = require("../planner/planGraph");

function topologicalBatches(steps) {
  return getExecutionLevels({ steps });
}

async function runParallel(steps, runStep) {
  const batches = getExecutionLevels({ steps });
  const results = [];

  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map((step) => runStep(step)));
    results.push(...batchResults);
    if (batchResults.some((result) => result.status === "failed")) {
      break;
    }
  }

  return results;
}

module.exports = {
  topologicalBatches,
  runParallel
};