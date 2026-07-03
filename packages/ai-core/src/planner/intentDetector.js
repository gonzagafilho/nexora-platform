function createIntentDetector(options = {}) {
  const keywords = options.keywords || {
    plan: ["plano", "plan", "estrategia"],
    summarize: ["resumo", "sumario", "summarize"],
    explain: ["explica", "explain", "como"],
    execute: ["executa", "execute", "faça", "faca"]
  };

  function detectIntent(message = "") {
    const normalized = String(message).toLowerCase();
    const intents = Object.keys(keywords);

    for (const intent of intents) {
      if (keywords[intent].some((token) => normalized.includes(token))) {
        return {
          intent,
          confidence: 0.85
        };
      }
    }

    return {
      intent: "answer",
      confidence: 0.5
    };
  }

  return {
    detectIntent
  };
}

module.exports = {
  createIntentDetector
};