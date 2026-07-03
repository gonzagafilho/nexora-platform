const { createBuiltinSkill } = require("./baseSkill");

function createNotificationSkill() {
  return [
    createBuiltinSkill({
      name: "notification.email",
      description: "Envia email",
      version: "1.0.0",
      category: "notification",
      permissions: ["notification:send"],
      enabled: true,
      execute: async (payload) => ({ channel: "email", sent: true, to: payload.to || "n/a" })
    }),
    createBuiltinSkill({
      name: "notification.push",
      description: "Envia push",
      version: "1.0.0",
      category: "notification",
      permissions: ["notification:send"],
      enabled: true,
      execute: async () => ({ channel: "push", sent: true })
    }),
    createBuiltinSkill({
      name: "notification.whatsapp",
      description: "Envia whatsapp",
      version: "1.0.0",
      category: "notification",
      permissions: ["notification:send"],
      enabled: true,
      execute: async () => ({ channel: "whatsapp", sent: true })
    })
  ];
}

module.exports = {
  createNotificationSkill
};