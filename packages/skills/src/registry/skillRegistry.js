const { validateSkillDefinition } = require("../contracts/skillContract");
const { normalizeSkillName } = require("../utils/normalizeSkillName");
const { createSkillEventEmitter } = require("../events/skillEventEmitter");
const { SKILL_EVENTS } = require("../events/skillEvents");

function createSkillRegistry(options = {}) {
  const registry = new Map();
  const eventEmitter = options.eventEmitter || createSkillEventEmitter();

  function validate(skill) {
    return validateSkillDefinition(skill);
  }

  function register(skill) {
    validate(skill);
    const normalizedName = normalizeSkillName(skill.name);
    const normalizedSkill = {
      ...skill,
      name: normalizedName,
      toolId: skill.toolId || normalizedName,
      toolName: skill.toolName || normalizedName,
      toolCategory: skill.toolCategory || skill.category,
      toolDescription: skill.toolDescription || skill.description,
      enabled: skill.enabled !== false
    };
    registry.set(normalizedName, normalizedSkill);
    eventEmitter.emit(SKILL_EVENTS.SKILL_REGISTERED, { name: normalizedName });
    return normalizedSkill;
  }

  function unregister(name) {
    const normalizedName = normalizeSkillName(name);
    const removed = registry.delete(normalizedName);
    if (removed) {
      eventEmitter.emit(SKILL_EVENTS.SKILL_UNREGISTERED, { name: normalizedName });
    }
    return removed;
  }

  function get(name) {
    return registry.get(normalizeSkillName(name)) || null;
  }

  function has(name) {
    return registry.has(normalizeSkillName(name));
  }

  function list() {
    return Array.from(registry.values());
  }

  function listByCategory(category) {
    return list().filter((skill) => skill.category === category);
  }

  function listTools() {
    return list();
  }

  function getTool(name) {
    return get(name);
  }

  function searchTools(query = "") {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    if (!normalizedQuery) {
      return listTools();
    }

    return listTools().filter((tool) => {
      const haystack = [
        tool.name,
        tool.description,
        tool.category,
        tool.toolName,
        tool.toolDescription,
        tool.toolCategory
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }

  function enable(name) {
    const skill = get(name);
    if (!skill) {
      return null;
    }
    skill.enabled = true;
    eventEmitter.emit(SKILL_EVENTS.SKILL_ENABLED, { name: skill.name });
    return skill;
  }

  function disable(name) {
    const skill = get(name);
    if (!skill) {
      return null;
    }
    skill.enabled = false;
    eventEmitter.emit(SKILL_EVENTS.SKILL_DISABLED, { name: skill.name });
    return skill;
  }

  return {
    register,
    unregister,
    get,
    has,
    list,
    listByCategory,
    listTools,
    getTool,
    searchTools,
    enable,
    disable,
    validate,
    eventEmitter
  };
}

module.exports = {
  createSkillRegistry
};