async function executeRollback(step, context, reason) {
  if (!step.rollback || typeof step.rollback.execute !== "function") {
    return { rolledBack: false };
  }

  const result = await step.rollback.execute({
    step,
    context,
    reason
  });

  return {
    rolledBack: true,
    result
  };
}

module.exports = {
  executeRollback
};