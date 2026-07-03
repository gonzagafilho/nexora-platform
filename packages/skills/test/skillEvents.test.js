const test = require("node:test");
const assert = require("node:assert/strict");

const { createSkillEventEmitter } = require("../src");

test("emitter registra historico", () => {
  const emitter = createSkillEventEmitter();
  emitter.emit("EventA", { ok: true });
  emitter.emit("EventB", { ok: false });
  assert.equal(emitter.getHistory().length, 2);
});

test("on e off handlers", () => {
  const emitter = createSkillEventEmitter();
  let calls = 0;
  const handler = () => {
    calls += 1;
  };

  emitter.on("Ping", handler);
  emitter.emit("Ping", {});
  emitter.off("Ping", handler);
  emitter.emit("Ping", {});

  assert.equal(calls, 1);
});

test("listEvents retorna eventos inscritos", () => {
  const emitter = createSkillEventEmitter();
  const noop = () => {};
  emitter.on("A", noop);
  emitter.on("B", noop);
  const events = emitter.listEvents();
  assert.ok(events.includes("A"));
  assert.ok(events.includes("B"));
});

test("emit retorna evento com timestamp", () => {
  const emitter = createSkillEventEmitter();
  const event = emitter.emit("X", { a: 1 });
  assert.equal(event.eventName, "X");
  assert.ok(typeof event.timestamp === "string");
});