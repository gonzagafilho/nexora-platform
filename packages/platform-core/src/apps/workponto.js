module.exports = {
  id: "workponto",
  projectKey: "workponto",
  name: "WorkPonto",
  version: "0.2.0",
  icon: "workflow",
  description: "App de jornada e operações com integração ao runtime da plataforma.",
  enabled: true,
  modules: ["core", "workflow", "notifications"],
  permissions: ["module:core", "module:projects", "module:notifications"],
  skills: ["workflow", "notification"],
  routes: ["/dashboard", "/workflow-dashboard"],
  agentProfile: {
    primary: ["workflow", "notification"],
    fallback: "assistant"
  }
};
