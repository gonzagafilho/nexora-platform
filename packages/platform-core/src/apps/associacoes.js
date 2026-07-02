module.exports = {
  id: "associacoes",
  projectKey: "associacoes",
  name: "NEXORA Associações",
  version: "0.2.0",
  icon: "intelligence",
  description:
    "Gestão completa de associações, mensalidades e relacionamento com associados.",
  enabled: true,
  modules: [
    "core",
    "associates",
    "memberbilling",
    "protocols",
    "financial",
    "notifications"
  ],
  permissions: [
    "module:core",
    "module:associates",
    "module:memberbilling",
    "module:protocols",
    "module:financial"
  ],
  skills: ["finance", "protocol", "associate", "notification"],
  routes: ["/dashboard", "/associados", "/mensalidades", "/financeiro", "/protocolos"],
  agentProfile: {
    primary: ["finance", "protocol", "associate", "notification"],
    fallback: "assistant"
  }
};
