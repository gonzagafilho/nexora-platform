function resolveAssistantCapabilities(input = {}) {
  const base = ["answer", "summarize", "explain"];
  const skills = Array.isArray(input.skills) ? input.skills : [];
  const dynamic = skills.map((skill) => `skill:${skill}`);

  return Array.from(new Set([...base, ...dynamic]));
}

module.exports = {
  resolveAssistantCapabilities
};