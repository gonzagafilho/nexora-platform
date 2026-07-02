module.exports = {
  id: "chatbot",
  projectKey: "chatbot",
  name: "Chatbot",
  version: "0.2.0",
  icon: "intelligence",
  description: "App conversacional com memória e orquestração multi-skill.",
  enabled: true,
  modules: ["core", "ai", "memory", "orchestrator", "skills"],
  permissions: ["module:core", "module:notifications"],
  skills: ["assistant", "workflow", "notification"],
  routes: ["/ia-chat", "/dashboard/ai-center"],
  agentProfile: {
    primary: ["assistant", "workflow", "notification"],
    fallback: "assistant"
  }
};
