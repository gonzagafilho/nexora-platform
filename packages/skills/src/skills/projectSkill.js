const { createBuiltinSkill } = require("./baseSkill");

function createProjectSkill() {
  return [
    createBuiltinSkill({
      name: "project.list",
      description: "Lista projetos",
      version: "1.0.0",
      category: "project",
      permissions: ["project:read"],
      enabled: true,
      execute: async () => [{ id: "proj-a" }, { id: "proj-b" }]
    }),
    createBuiltinSkill({
      name: "project.details",
      description: "Detalhes projeto",
      version: "1.0.0",
      category: "project",
      permissions: ["project:read"],
      enabled: true,
      execute: async (payload) => ({ id: payload.id || "proj-a", details: true })
    })
  ];
}

module.exports = {
  createProjectSkill
};