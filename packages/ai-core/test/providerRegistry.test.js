const test = require("node:test");
const assert = require("node:assert/strict");

const { createProviderRegistry } = require("../src");

test("registry inicia com mock provider", () => {
  const registry = createProviderRegistry();
  assert.equal(registry.hasProvider("mock"), true);
  assert.ok(registry.listProviders().length >= 1);
});

test("registry registra provider customizado", async () => {
  const registry = createProviderRegistry();
  registry.registerProvider({
    name: "custom",
    async execute() {
      return { text: "ok", usage: null, metadata: {} };
    },
    async health() {
      return { status: "up" };
    },
    capabilities() {
      return ["chat"];
    }
  });

  const provider = registry.getProvider("custom");
  const result = await provider.execute("x", {});
  assert.equal(result.text, "ok");
});

test("registry falha ao buscar provider inexistente", () => {
  const registry = createProviderRegistry();

  assert.throws(() => registry.getProvider("inexistente"), {
    name: "ProviderError",
    code: "PROVIDER_NOT_FOUND"
  });
});

test("openai provider usa adapter sem SDK direto", async () => {
  const registry = createProviderRegistry();
  const openai = registry.createOpenAIProvider({
    invoke: async ({ prompt }) => ({
      text: `adapter:${prompt}`,
      model: "gpt-adapter",
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }
    })
  });

  registry.registerProvider(openai);
  const result = await registry.getProvider("openai").execute("teste", {});
  assert.equal(result.text, "adapter:teste");
  assert.equal(result.metadata.model, "gpt-adapter");
});

test("registry exige interface generica completa", () => {
  const registry = createProviderRegistry();

  assert.throws(
    () => registry.registerProvider({ name: "bad", execute: async () => ({ text: "x" }) }),
    { name: "ProviderError", code: "INVALID_PROVIDER_HEALTH" }
  );
});

test("registry faz health check por provider", async () => {
  const registry = createProviderRegistry();
  const status = await registry.checkProviderHealth("mock");
  assert.equal(status.status, "up");
});