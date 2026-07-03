const { createExecutionContext } = require("./executionContext");
const { createExecutionResult } = require("./executionResult");
const { validatePayload } = require("../utils/validatePayload");
const { normalizeSkillName } = require("../utils/normalizeSkillName");
const { validateExecutionContext, validateExecutionResult } = require("../contracts/executorContract");
const { validateSkillPolicy } = require("../policy/skillPolicy");
const { createNoopSkillAdapter } = require("../adapters/noopAdapter");
const { validateSkillAdapter } = require("../contracts/adapterContract");
const { createSkillEventEmitter } = require("../events/skillEventEmitter");
const { SKILL_EVENTS } = require("../events/skillEvents");
const { SkillError } = require("../errors/SkillError");

function createSkillExecutor(options = {}) {
  const registry = options.registry;
  const adapter = options.adapter || createNoopSkillAdapter();
  const eventEmitter = options.eventEmitter || createSkillEventEmitter();

  if (!registry || typeof registry.get !== "function") {
    throw new SkillError("Executor requires a registry", "MISSING_REGISTRY");
  }

  validateSkillAdapter(adapter);

  async function execute(name, payload = {}, context = {}) {
    const startedAt = Date.now();
    const normalizedName = normalizeSkillName(name);
    validatePayload(payload);

    const executionContext = createExecutionContext(context);
    validateExecutionContext(executionContext);

    const skill = registry.get(normalizedName);
    if (!skill) {
      const result = createExecutionResult({
        ok: false,
        skill: normalizedName,
        durationMs: Date.now() - startedAt,
        error: {
          code: "SKILL_NOT_FOUND",
          message: `Skill not found: ${normalizedName}`
        }
      });
      validateExecutionResult(result);
      return result;
    }

    if (skill.enabled === false) {
      const result = createExecutionResult({
        ok: false,
        skill: skill.name,
        durationMs: Date.now() - startedAt,
        error: {
          code: "SKILL_DISABLED",
          message: `Skill disabled: ${skill.name}`
        }
      });
      validateExecutionResult(result);
      return result;
    }

    try {
      validateSkillPolicy(skill, payload, executionContext);
    } catch (error) {
      if (error.code === "CONFIRMATION_REQUIRED") {
        eventEmitter.emit(SKILL_EVENTS.SKILL_CONFIRMATION_REQUIRED, {
          skill: skill.name,
          tenantId: executionContext.tenantId
        });
      }

      eventEmitter.emit(SKILL_EVENTS.SKILL_PERMISSION_DENIED, {
        skill: skill.name,
        tenantId: executionContext.tenantId,
        code: error.code
      });

      const deniedResult = createExecutionResult({
        ok: false,
        skill: skill.name,
        durationMs: Date.now() - startedAt,
        error: {
          code: error.code || "SKILL_POLICY_DENIED",
          message: error.message
        }
      });
      validateExecutionResult(deniedResult);
      return deniedResult;
    }

    eventEmitter.emit(SKILL_EVENTS.SKILL_EXECUTION_STARTED, {
      skill: skill.name,
      tenantId: executionContext.tenantId
    });

    try {
      let data;
      if (await adapter.canExecute(skill.name, executionContext)) {
        data = await adapter.execute(skill.name, payload, executionContext);
      } else {
        data = await skill.execute(payload, executionContext);
      }

      const result = createExecutionResult({
        ok: true,
        skill: skill.name,
        durationMs: Date.now() - startedAt,
        data,
        metadata: {
          adapterCapabilities: adapter.listCapabilities()
        }
      });

      eventEmitter.emit(SKILL_EVENTS.SKILL_EXECUTION_SUCCEEDED, {
        skill: skill.name,
        tenantId: executionContext.tenantId,
        durationMs: result.durationMs
      });

      validateExecutionResult(result);
      return result;
    } catch (error) {
      const failedResult = createExecutionResult({
        ok: false,
        skill: skill.name,
        durationMs: Date.now() - startedAt,
        error: {
          code: error.code || "SKILL_EXECUTION_FAILED",
          message: error.message
        }
      });

      eventEmitter.emit(SKILL_EVENTS.SKILL_EXECUTION_FAILED, {
        skill: skill.name,
        tenantId: executionContext.tenantId,
        code: failedResult.error.code
      });

      validateExecutionResult(failedResult);
      return failedResult;
    }
  }

  return {
    execute,
    eventEmitter
  };
}

module.exports = {
  createSkillExecutor
};