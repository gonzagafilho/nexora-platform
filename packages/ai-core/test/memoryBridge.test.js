const test = require("node:test");
const assert = require("node:assert/strict");

const { createMemoryBridge } = require("../src");

test("memory bridge usa adapter quando fornecido", async () => {
  const bridge = createMemoryBridge({
    async resolveContext() {
      return { userSegment: "premium" };
    },
    async resolveMemory() {
      return [{ role: "assistant", content: "memoria" }];
    },
    async saveMemory() {
      return { saved: true };
    }
  });

  const context = await bridge.resolveContext({ userId: "u1" });
  const memory = await bridge.resolveMemory({ userId: "u1" });
  const save = await bridge.saveMemory({ userId: "u1" });

  assert.equal(context.userSegment, "premium");
  assert.equal(memory.length, 1);
  assert.equal(save.saved, true);
});

test("memory bridge possui fallback sem adapter", async () => {
  const bridge = createMemoryBridge();

  const context = await bridge.resolveContext({});
  const memory = await bridge.resolveMemory({});
  const save = await bridge.saveMemory({});

  assert.deepEqual(context, {});
  assert.deepEqual(memory, []);
  assert.equal(save.saved, false);
});