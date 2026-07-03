const test = require("node:test");
const assert = require("node:assert/strict");

const { runSequential } = require("../src/strategies/sequentialStrategy");
const { runParallel, topologicalBatches } = require("../src/strategies/parallelStrategy");

test("strategy sequential executa em ordem", async () => {
  const order = [];
  const steps = [
    { id: "s3", dependsOn: ["s1", "s2"] },
    { id: "s1", dependsOn: [] },
    { id: "s2", dependsOn: [] }
  ];

  const results = await runSequential(steps, async (step) => {
    order.push(step.id);
    return { ...step, status: "completed" };
  });

  assert.equal(results.length, 3);
  assert.ok(order.indexOf("s1") < order.indexOf("s3"));
  assert.ok(order.indexOf("s2") < order.indexOf("s3"));
});

test("strategy sequential para em falha", async () => {
  const steps = [{ id: "s1" }, { id: "s2" }, { id: "s3" }];
  const results = await runSequential(steps, async (step) => {
    if (step.id === "s2") {
      return { ...step, status: "failed" };
    }
    return { ...step, status: "completed" };
  });

  assert.equal(results.length, 2);
});

test("strategy parallel gera batches por dependencia", () => {
  const steps = [
    { id: "s1", dependsOn: [] },
    { id: "s2", dependsOn: [] },
    { id: "s3", dependsOn: ["s1", "s2"] }
  ];

  const batches = topologicalBatches(steps);
  assert.equal(batches.length, 2);
  assert.equal(batches[0].length, 2);
  assert.equal(batches[1].length, 1);
});

test("strategy parallel usa niveis", async () => {
  const levelsSeen = [];
  const steps = [
    { id: "s1", dependsOn: [] },
    { id: "s2", dependsOn: ["s1"] },
    { id: "s3", dependsOn: ["s1"] },
    { id: "s4", dependsOn: ["s2", "s3"] }
  ];

  const results = await runParallel(steps, async (step) => {
    levelsSeen.push(step.id);
    return { ...step, status: "completed" };
  });

  assert.equal(results.length, 4);
  assert.ok(levelsSeen.indexOf("s1") < levelsSeen.indexOf("s4"));
});

test("strategy parallel executa batches", async () => {
  const order = [];
  const steps = [
    { id: "s1", dependsOn: [] },
    { id: "s2", dependsOn: [] },
    { id: "s3", dependsOn: ["s1", "s2"] }
  ];

  const results = await runParallel(steps, async (step) => {
    order.push(step.id);
    return { ...step, status: "completed" };
  });

  assert.equal(results.length, 3);
  assert.ok(order.includes("s3"));
});

test("strategy parallel para em falha", async () => {
  const steps = [
    { id: "s1", dependsOn: [] },
    { id: "s2", dependsOn: [] },
    { id: "s3", dependsOn: ["s1"] }
  ];

  const results = await runParallel(steps, async (step) => {
    if (step.id === "s2") {
      return { ...step, status: "failed" };
    }
    return { ...step, status: "completed" };
  });

  assert.equal(results.some((r) => r.status === "failed"), true);
});