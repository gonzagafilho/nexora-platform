const test = require("node:test");
const assert = require("node:assert/strict");

const { createExecutionJournal } = require("../src");

test("journal registra entradas", () => {
  const journal = createExecutionJournal();
  journal.info("Pipeline Started", { pipelineId: "p1" });
  journal.warn("Step Retried", { stepId: "s1" });
  journal.error("Pipeline Failed", { pipelineId: "p1" });

  const entries = journal.list();
  assert.equal(entries.length, 3);
  assert.equal(entries[0].type, "info");
  assert.equal(entries[1].type, "warn");
  assert.equal(entries[2].type, "error");
  assert.ok(entries[0].timestamp);
});

test("journal clear", () => {
  const journal = createExecutionJournal();
  journal.append("info", "x", {});
  assert.equal(journal.list().length, 1);
  journal.clear();
  assert.equal(journal.list().length, 0);
});