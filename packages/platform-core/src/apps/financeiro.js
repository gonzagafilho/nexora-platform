module.exports = {
  id: "financeiro",
  projectKey: "financeiro",
  name: "NEXORA Financeiro",
  version: "0.2.0",
  icon: "receipt",
  description: "App financeiro especializado com skills de cobrança e conciliação.",
  enabled: true,
  modules: ["core", "financial", "memberbilling", "notifications"],
  permissions: ["module:core", "module:financial", "module:memberbilling"],
  skills: ["finance", "report", "notification"],
  routes: ["/financeiro", "/mensalidades"],
  agentProfile: {
    primary: ["finance", "report", "notification"],
    fallback: "assistant"
  }
};
