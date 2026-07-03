function topologicalBatches(steps) {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const unresolved = new Set(steps.map((step) => step.id));
  const resolved = new Set();
  const batches = [];

  while (unresolved.size > 0) {
    const ready = Array.from(unresolved)
      .map((id) => byId.get(id))
      .filter((step) => (step.dependsOn || []).every((dependencyId) => resolved.has(dependencyId)));

    if (ready.length === 0) {
      break;
    }

    ready.forEach((step) => {
      unresolved.delete(step.id);
      resolved.add(step.id);
    });

    batches.push(ready);
  }

  return batches;
}

async function runParallel(steps, runStep) {
  const batches = topologicalBatches(steps);
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