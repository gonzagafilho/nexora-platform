function createAgentResult(value = {}) { return { ok: Boolean(value.ok), agentId:value.agentId, durationMs:value.durationMs || 0, data:value.data ?? null, error:value.error ?? null, usedTools:value.usedTools || [], memoryRefs:value.memoryRefs || [], pipelineId:value.pipelineId, metadata:value.metadata || {} }; }
module.exports = { createAgentResult };
