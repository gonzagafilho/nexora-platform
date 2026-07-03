const { createBuiltinSkill } = require("./baseSkill");

function createAssociateSkill() {
  return [
    createBuiltinSkill({
      name: "associate.find",
      description: "Busca associado",
      version: "1.0.0",
      category: "associate",
      permissions: ["associate:read"],
      enabled: true,
      execute: async (payload) => ({ id: payload.id || "assoc-001", found: true })
    }),
    createBuiltinSkill({
      name: "associate.list",
      description: "Lista associados",
      version: "1.0.0",
      category: "associate",
      permissions: ["associate:read"],
      enabled: true,
      execute: async () => [{ id: "assoc-001" }, { id: "assoc-002" }]
    }),
    createBuiltinSkill({
      name: "associate.details",
      description: "Detalhes do associado",
      version: "1.0.0",
      category: "associate",
      permissions: ["associate:read"],
      enabled: true,
      execute: async (payload) => ({ id: payload.id || "assoc-001", details: true })
    })
  ];
}

module.exports = {
  createAssociateSkill
};