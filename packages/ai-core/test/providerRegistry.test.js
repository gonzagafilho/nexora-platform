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
    async generate() {
      return { text: "ok", usage: null, metadata: {} };
    }
  });

  const provider = registry.getProvider("custom");
  const result = await provider.generate({ prompt: "x" });
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
  const result = await registry.getProvider("openai").generate({ prompt: "teste" });
  assert.equal(result.text, "adapter:teste");
  assert.equal(result.metadata.model, "gpt-adapter");
});