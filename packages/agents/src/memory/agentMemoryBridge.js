function createAgentMemoryBridge(adapter={}) { return { resolveContext(input,context){return adapter.resolveContext?.(input,context) ?? null;}, saveObservation(record,context){return adapter.saveObservation?.(record,context) ?? null;} }; }
module.exports = { createAgentMemoryBridge };
