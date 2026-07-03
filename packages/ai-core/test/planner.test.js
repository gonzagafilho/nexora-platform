const test = require("node:test");
const assert = require("node:assert/strict");

const { createIntentDetector, createResponsePlanner } = require("../src");
const { createContextResolver } = require("../src/planner/contextResolver");

test("intent detector identifica intent de plano", () => {
  const detector = createIntentDetector();
  const result = detector.detectIntent("crie um plano de atendimento");
  assert.equal(result.intent, "plan");
  assert.ok(result.confidence > 0.5);
});

test("intent detector retorna answer por default", () => {
  const detector = createIntentDetector();
  const result = detector.detectIntent("mensagem sem palavras chave");
  assert.equal(result.intent, "answer");
});

test("context resolver combina base memory context e intent", async () => {
  const detector = createIntentDetector();
  const resolver = createContextResolver({ intentDetector: detector });

  const result = await resolver.resolveContext({
    context: { tenantId: "t1", userId: "u1" },
    memoryContext: { tags: ["vip"] },
    message: "executa agora",
    project: "chatbot",
    skills: ["assistant"]
  });

  assert.equal(result.tenantId, "t1");
  assert.equal(result.project, "chatbot");
  assert.equal(result.intent, "execute");
  assert.deepEqual(result.memoryContext, { tags: ["vip"] });
});

test("response planner cria steps com ou sem skills", () => {
  const planner = createResponsePlanner();
  const withSkills = planner.createPlan({ intent: "plan", skills: ["finance"] });
  const withoutSkills = planner.createPlan({ intent: "answer", skills: [] });

  assert.ok(withSkills.steps.includes("apply-skills"));
  assert.ok(withoutSkills.steps.includes("skip-skills"));
  assert.equal(withSkills.intent, "plan");
});