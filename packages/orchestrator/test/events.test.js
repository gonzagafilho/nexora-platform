const test = require("node:test");
const assert = require("node:assert/strict");

const { createOrchestratorEventEmitter } = require("../src");

test("event emitter historico", () => {
  const emitter = createOrchestratorEventEmitter();
  emitter.emit("PipelineCreated", { id: "p1" });
  emitter.emit("PipelineStarted", { id: "p1" });
  assert.equal(emitter.getHistory().length, 2);
});

test("event emitter on off", () => {
  const emitter = createOrchestratorEventEmitter();
  let calls = 0;
  const handler = () => {
    calls += 1;
  };

  emitter.on("StepStarted", handler);
  emitter.emit("StepStarted", {});
  emitter.off("StepStarted", handler);
  emitter.emit("StepStarted", {});

  assert.equal(calls, 1);
});

test("event emitter listEvents", () => {
  const emitter = createOrchestratorEventEmitter();
  emitter.on("A", () => {});
  emitter.on("B", () => {});
  const events = emitter.listEvents();
  assert.ok(events.includes("A"));
  assert.ok(events.includes("B"));
});

test("event emitter payload", () => {
  const emitter = createOrchestratorEventEmitter();
  const event = emitter.emit("X", { ok: true });
  assert.equal(event.payload.ok, true);
});