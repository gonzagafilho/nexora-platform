const { normalizeContext } = require("../contracts/contextContract");

function createContextResolver(options = {}) {
  const detector = options.intentDetector;

  async function resolveContext(input = {}) {
    const baseContext = normalizeContext(input.context || {});
    const memoryContext = input.memoryContext || {};
    const detected = detector
      ? detector.detectIntent(input.message || "")
      : { intent: "answer", confidence: 0.5 };

    return {
      ...baseContext,
      memoryContext,
      intent: detected.intent,
      confidence: detected.confidence,
      project: input.project || null,
      skills: Array.isArray(input.skills) ? input.skills : []
    };
  }

  return {
    resolveContext
  };
}

module.exports = {
  createContextResolver
};