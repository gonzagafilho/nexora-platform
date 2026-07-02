module.exports = {
  id: "guardian",
  projectKey: "guardian",
  name: "Guardian",
  version: "0.2.0",
  icon: "bell",
  description: "App para monitoramento de alertas e eventos críticos por tenant.",
  enabled: true,
  modules: ["core", "notifications", "protocols"],
  permissions: ["module:core", "module:notifications", "module:protocols"],
  skills: ["notification", "protocol"],
  routes: ["/dashboard", "/notificacoes", "/protocolos"],
  agentProfile: {
    primary: ["notification", "protocol"],
    fallback: "assistant"
  }
};
