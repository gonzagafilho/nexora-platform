const { createBuiltinSkill } = require("./baseSkill");

function createProtocolSkill() {
  return [
    createBuiltinSkill({
      name: "protocol.create",
      description: "Cria protocolo",
      version: "1.0.0",
      category: "protocol",
      permissions: ["protocol:write"],
      enabled: true,
      execute: async (payload) => ({ protocolId: payload.protocolId || "prt-001", created: true })
    }),
    createBuiltinSkill({
      name: "protocol.list",
      description: "Lista protocolos",
      version: "1.0.0",
      category: "protocol",
      permissions: ["protocol:read"],
      enabled: true,
      execute: async () => [{ protocolId: "prt-001" }, { protocolId: "prt-002" }]
    }),
    createBuiltinSkill({
      name: "protocol.details",
      description: "Detalhes protocolo",
      version: "1.0.0",
      category: "protocol",
      permissions: ["protocol:read"],
      enabled: true,
      execute: async (payload) => ({ protocolId: payload.protocolId || "prt-001", status: "open" })
    })
  ];
}

module.exports = {
  createProtocolSkill
};