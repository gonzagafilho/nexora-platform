module.exports = {
  id: "palpites",
  projectKey: "palpites",
  name: "Palpites",
  version: "0.2.0",
  icon: "star",
  description: "App de engajamento e campanhas com eventos e notificações.",
  enabled: true,
  modules: ["core", "notifications", "events"],
  permissions: ["module:core", "module:notifications"],
  skills: ["notification", "workflow"],
  routes: ["/dashboard", "/notificacoes"],
  agentProfile: {
    primary: ["notification", "workflow"],
    fallback: "assistant"
  }
};
