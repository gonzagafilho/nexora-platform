const { normalizeAgentName } = require("./normalizeAgentName");
function scoreCapability(capability, query) {
  const q = normalizeAgentName(typeof query === "object" ? query.intent || query.text : query);
  if (!q) return 0;
  const terms = [capability.id, capability.name, capability.description, capability.domain, ...(capability.intents || [])].map(normalizeAgentName);
  let match = 0;
  for (const term of terms) { if (term === q) match = Math.max(match, 1); else if (term.includes(q) || q.includes(term)) match = Math.max(match, 0.8); else { const words = q.split("."); match = Math.max(match, words.filter((word) => term.includes(word)).length / words.length * 0.65); } }
  return Number((match * (Number(capability.confidence ?? 1)) + Number(capability.priority || 0) / 1000).toFixed(4));
}
module.exports = { scoreCapability };
