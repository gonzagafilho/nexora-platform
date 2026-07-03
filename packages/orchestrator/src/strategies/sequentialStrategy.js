const { topologicalSort } = require("../planner/planGraph");

async function runSequential(steps, runStep) {
  const orderedSteps = topologicalSort({ steps });
  const results = [];
  for (const step of orderedSteps) {
    const result = await runStep(step);
    results.push(result);
    if (result.status === "failed") {
      break;
    }
  }
  return results;
}

module.exports = {
  runSequential
};