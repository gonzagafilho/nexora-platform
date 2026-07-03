function createExecutionResult(input = {}) {
  return {
    ok: Boolean(input.ok),
    skill: input.skill || null,
    durationMs: typeof input.durationMs === "number" ? input.durationMs : 0,
    data: input.data || null,
    error: input.error || null,
    metadata: input.metadata || {}
  };
}

module.exports = {
  createExecutionResult
};