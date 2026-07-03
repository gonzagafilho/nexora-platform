const test = require("node:test");
const assert = require("node:assert/strict");

const { createAssistant } = require("../src");
const { createMockProvider } = require("../src/providers/mockProvider");

test("assistant retorna response metadata usage e plan", async () => {
  const provider = createMockProvider({ fixedResponse: "Resposta do assistant" });
  const assistant = createAssistant({ provider });

  const result = await assistant.run({
    message: "Me ajuda com um resumo",
    context: { tenantId: "t-1", userId: "u-1" },
    skills: ["finance"],
    project: "associacoes"
  });

  assert.equal(result.response, "Resposta do assistant");
  assert.ok(result.metadata.intent);
  assert.ok(result.usage);
  assert.ok(result.plan);
  assert.equal(result.plan.intent, result.metadata.intent);
});

test("assistant falha para mensagem invalida", async () => {
  const provider = createMockProvider();
  const assistant = createAssistant({ provider });

  await assert.rejects(
    () => assistant.run({ message: "", context: {} }),
    { name: "AIError", code: "INVALID_ASSISTANT_MESSAGE" }
  );
});

test("assistant utiliza memory bridge para salvar memoria", async () => {
  const provider = createMockProvider({ fixedResponse: "ok" });
  const calls = {
    resolveContext: 0,
    resolveMemory: 0,
    saveMemory: 0
  };

  const memoryBridge = {
    async resolveContext() {
      calls.resolveContext += 1;
      return { profile: "admin" };
    },
    async resolveMemory() {
      calls.resolveMemory += 1;
      return [{ content: "historico" }];
    },
    async saveMemory() {
      calls.saveMemory += 1;
      return { saved: true };
    }
  };

  const assistant = createAssistant({ provider, memoryBridge });
  await assistant.run({
    message: "executa um plano",
    context: { userId: "u-1" }
  });

  assert.equal(calls.resolveContext, 1);
  assert.equal(calls.resolveMemory, 1);
  assert.equal(calls.saveMemory, 1);
});