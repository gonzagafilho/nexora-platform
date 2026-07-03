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

test("assistant engine usa somente provider.execute", async () => {
  let executeCalls = 0;
  const provider = {
    name: "generic-provider",
    async execute(prompt) {
      executeCalls += 1;
      return {
        text: `ok:${prompt.length}`,
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        metadata: { provider: "generic-provider" }
      };
    },
    async health() {
      return { status: "up" };
    },
    capabilities() {
      return ["chat"];
    },
    async generate() {
      throw new Error("generate must never be called");
    }
  };

  const assistant = createAssistant({ provider });
  const result = await assistant.run({
    message: "teste provider execute",
    context: { userId: "u-1" }
  });

  assert.equal(executeCalls, 1);
  assert.ok(result.response.startsWith("ok:"));
});

test("assistant rejeita provider sem contrato generico", () => {
  assert.throws(
    () => createAssistant({ provider: { name: "bad", execute: async () => ({ text: "x" }) } }),
    { name: "ProviderError", code: "INVALID_PROVIDER_HEALTH" }
  );
});