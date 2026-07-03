const { createBuiltinSkill } = require("./baseSkill");

function createWorkflowSkill() {
  return [
    createBuiltinSkill({
      name: "workflow.start",
      description: "Inicia workflow",
      version: "1.0.0",
      category: "workflow",
      permissions: ["workflow:write"],
      enabled: true,
      execute: async () => ({ workflowId: "wf-001", status: "started" })
    }),
    createBuiltinSkill({
      name: "workflow.status",
      description: "Status workflow",
      version: "1.0.0",
      category: "workflow",
      permissions: ["workflow:read"],
      enabled: true,
      execute: async () => ({ workflowId: "wf-001", status: "running" })
    })
  ];
}

module.exports = {
  createWorkflowSkill
};