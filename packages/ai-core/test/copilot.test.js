const test = require("node:test");
const assert = require("node:assert/strict");

const { createCopilot, createPromptBuilder, createConversation } = require("../src");
const { createMockProvider } = require("../src/providers/mockProvider");

test("copilot executa prompt e atualiza conversa", async () => {
  const provider = createMockProvider({ fixedResponse: "copilot response" });
  const copilot = createCopilot({ provider });

  const result = await copilot.run({
    message: "Explica o modulo AI",
    context: { tenantId: "t1" },
    project: "nexora",
    skills: ["assistant"]
  });

  assert.equal(result.response, "copilot response");
  assert.equal(result.conversation.length, 2);
  assert.ok(result.metadata.prompt.includes("Explica o modulo AI"));
});

test("prompt builder inclui contexto capabilities e historico", () => {
  const builder = createPromptBuilder({ prefix: "Teste" });
  const prompt = builder.buildPrompt({
    message: "Oi",
    context: { tenantId: "t1" },
    capabilities: ["answer", "skill:finance"],
    history: [{ role: "user", content: "antes" }],
    project: "associacoes"
  });

  assert.ok(prompt.includes("Teste assistant"));
  assert.ok(prompt.includes("Project: associacoes"));
  assert.ok(prompt.includes("skill:finance"));
});

test("conversation adiciona lista e limpa mensagens", () => {
  const conversation = createConversation();
  conversation.addMessage({ role: "user", content: "one" });
  conversation.addMessage({ role: "assistant", content: "two" });

  assert.equal(conversation.listMessages().length, 2);
  assert.equal(conversation.getLastMessage().content, "two");

  conversation.clear();
  assert.equal(conversation.listMessages().length, 0);
});

test("copilot valida entrada invalida", async () => {
  const provider = createMockProvider();
  const copilot = createCopilot({ provider });

  await assert.rejects(() => copilot.run({ message: "" }), {
    name: "AIError",
    code: "INVALID_COPILOT_MESSAGE"
  });
});