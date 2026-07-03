const { createBuiltinSkill } = require("./baseSkill");

function createFinanceSkill() {
  return [
    createBuiltinSkill({
      name: "finance.createbolepix",
      description: "Cria um boleto pix",
      version: "1.0.0",
      category: "finance",
      permissions: ["finance:write"],
      confirmationRequired: true,
      enabled: true,
      execute: async (payload, context) => {
        if (context.actions && typeof context.actions.createBolePix === "function") {
          return context.actions.createBolePix(payload, context);
        }
        return {
          id: "bp-mock-001",
          amount: payload.amount || 0,
          status: "created"
        };
      }
    }),
    createBuiltinSkill({
      name: "finance.getinvoice",
      description: "Consulta uma fatura",
      version: "1.0.0",
      category: "finance",
      permissions: ["finance:read"],
      enabled: true,
      execute: async (payload, context) => {
        if (context.actions && typeof context.actions.getInvoice === "function") {
          return context.actions.getInvoice(payload, context);
        }
        return { invoiceId: payload.invoiceId || "inv-001", status: "open" };
      }
    }),
    createBuiltinSkill({
      name: "finance.listinvoices",
      description: "Lista faturas",
      version: "1.0.0",
      category: "finance",
      permissions: ["finance:read"],
      enabled: true,
      execute: async () => [{ invoiceId: "inv-001" }, { invoiceId: "inv-002" }]
    })
  ];
}

module.exports = {
  createFinanceSkill
};