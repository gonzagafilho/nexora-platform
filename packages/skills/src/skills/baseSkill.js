class BaseSkill {
  constructor(definition) {
    this.name = definition.name;
    this.description = definition.description;
    this.version = definition.version;
    this.category = definition.category;
    this.permissions = definition.permissions || [];
    this.confirmationRequired = Boolean(definition.confirmationRequired);
    this.enabled = definition.enabled !== false;
    this.inputSchema = definition.inputSchema || {};
    this.outputSchema = definition.outputSchema || {};
    this.execute = definition.execute;
  }
}

function createBuiltinSkill(definition) {
  return new BaseSkill(definition);
}

module.exports = {
  BaseSkill,
  createBuiltinSkill
};