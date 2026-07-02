module.exports = {
  id: "xpdcnet",
  projectKey: "xpdcnet",
  name: "XPDCNET",
  version: "0.2.0",
  icon: "projects",
  description: "App para operações XPDCNET com núcleo compartilhado da plataforma.",
  enabled: true,
  modules: ["core", "projects", "assets", "financial", "notifications"],
  permissions: ["module:core", "module:projects", "module:assets", "module:financial"],
  skills: ["project", "asset", "finance"],
  routes: ["/dashboard", "/projetos", "/patrimonio", "/financeiro"],
  agentProfile: {
    primary: ["project", "asset", "finance"],
    fallback: "assistant"
  }
};
