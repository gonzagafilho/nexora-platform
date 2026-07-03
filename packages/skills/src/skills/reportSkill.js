const { createBuiltinSkill } = require("./baseSkill");

function createReportSkill() {
  return [
    createBuiltinSkill({
      name: "report.generatepdf",
      description: "Gera PDF",
      version: "1.0.0",
      category: "report",
      permissions: ["report:generate"],
      enabled: true,
      execute: async () => ({ format: "pdf", generated: true })
    }),
    createBuiltinSkill({
      name: "report.exportexcel",
      description: "Exporta excel",
      version: "1.0.0",
      category: "report",
      permissions: ["report:generate"],
      enabled: true,
      execute: async () => ({ format: "excel", generated: true })
    })
  ];
}

module.exports = {
  createReportSkill
};