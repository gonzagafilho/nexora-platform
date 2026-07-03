async function runSequential(steps, runStep) {
  const results = [];
  for (const step of steps) {
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