const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildPlanGraph,
  detectCycle,
  topologicalSort,
  getExecutionLevels
} = require("../src");

function plan(steps) {
  return { steps };
}

test("grafo simples", () => {
  const graph = buildPlanGraph(
    plan([
      { id: "s1", dependsOn: [] },
      { id: "s2", dependsOn: ["s1"] }
    ])
  );

  assert.equal(graph.nodes.size, 2);
  assert.equal(graph.edges.length, 1);
});

test("dependsOn vira aresta", () => {
  const graph = buildPlanGraph(
    plan([
      { id: "s1", dependsOn: [] },
      { id: "s2", dependsOn: ["s1"] },
      { id: "s3", dependsOn: ["s1"] }
    ])
  );

  assert.deepEqual(graph.edges, [
    { from: "s1", to: "s2" },
    { from: "s1", to: "s3" }
  ]);
});

test("detecta ciclo", () => {
  const hasCycle = detectCycle(
    plan([
      { id: "s1", dependsOn: ["s2"] },
      { id: "s2", dependsOn: ["s1"] }
    ])
  );

  assert.equal(hasCycle, true);
});

test("ordenacao topologica", () => {
  const sorted = topologicalSort(
    plan([
      { id: "s3", dependsOn: ["s1", "s2"] },
      { id: "s1", dependsOn: [] },
      { id: "s2", dependsOn: [] }
    ])
  );

  const ids = sorted.map((step) => step.id);
  assert.ok(ids.indexOf("s1") < ids.indexOf("s3"));
  assert.ok(ids.indexOf("s2") < ids.indexOf("s3"));
});

test("niveis de execucao paralela", () => {
  const levels = getExecutionLevels(
    plan([
      { id: "step1", dependsOn: [] },
      { id: "step2", dependsOn: ["step1"] },
      { id: "step3", dependsOn: ["step1"] },
      { id: "step4", dependsOn: ["step2", "step3"] }
    ])
  );

  assert.equal(levels.length, 3);
  assert.deepEqual(levels[0].map((step) => step.id), ["step1"]);
  assert.deepEqual(levels[1].map((step) => step.id), ["step2", "step3"]);
  assert.deepEqual(levels[2].map((step) => step.id), ["step4"]);
});