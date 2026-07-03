const test = require("node:test");
const assert = require("node:assert/strict");

const { createPipelineStore, PIPELINE_STATUS } = require("../src");
const { createPipeline } = require("../src/pipeline/pipeline");

test("pipeline store save get", () => {
  const store = createPipelineStore();
  store.save({ id: "p1", tenantId: "t1", status: PIPELINE_STATUS.CREATED, events: [] });
  assert.equal(store.get("p1").id, "p1");
});

test("pipeline store list por status", () => {
  const store = createPipelineStore();
  store.save({ id: "p1", tenantId: "t1", status: PIPELINE_STATUS.CREATED, events: [] });
  store.save({ id: "p2", tenantId: "t1", status: PIPELINE_STATUS.FAILED, events: [] });

  assert.equal(store.list({ status: PIPELINE_STATUS.CREATED }).length, 1);
  assert.equal(store.list({ status: PIPELINE_STATUS.FAILED }).length, 1);
});

test("pipeline store list por tenant", () => {
  const store = createPipelineStore();
  store.save({ id: "p1", tenantId: "t1", status: PIPELINE_STATUS.CREATED, events: [] });
  store.save({ id: "p2", tenantId: "t2", status: PIPELINE_STATUS.CREATED, events: [] });
  assert.equal(store.list({ tenantId: "t1" }).length, 1);
});

test("pipeline store update", () => {
  const store = createPipelineStore();
  store.save({ id: "p1", tenantId: "t1", status: PIPELINE_STATUS.CREATED, events: [] });
  store.update("p1", { status: PIPELINE_STATUS.RUNNING });
  assert.equal(store.get("p1").status, PIPELINE_STATUS.RUNNING);
});

test("pipeline store appendEvent", () => {
  const store = createPipelineStore();
  store.save({ id: "p1", tenantId: "t1", status: PIPELINE_STATUS.CREATED, events: [] });
  store.appendEvent("p1", { eventName: "PipelineCreated" });
  assert.equal(store.get("p1").events.length, 1);
});

test("pipeline.toGraph", () => {
  const pipeline = createPipeline({
    id: "p1",
    intent: "x",
    tenantId: "t1",
    userId: "u1",
    status: PIPELINE_STATUS.CREATED,
    createdAt: new Date().toISOString(),
    steps: [
      { id: "s1", dependsOn: [] },
      { id: "s2", dependsOn: ["s1"] }
    ]
  });

  const graph = pipeline.toGraph();
  assert.equal(graph.nodes.size, 2);
  assert.equal(graph.edges.length, 1);
});

test("pipeline.toExecutionOrder", () => {
  const pipeline = createPipeline({
    id: "p1",
    intent: "x",
    tenantId: "t1",
    userId: "u1",
    status: PIPELINE_STATUS.CREATED,
    createdAt: new Date().toISOString(),
    steps: [
      { id: "s3", dependsOn: ["s1", "s2"] },
      { id: "s1", dependsOn: [] },
      { id: "s2", dependsOn: [] }
    ]
  });

  const order = pipeline.toExecutionOrder().map((step) => step.id);
  assert.ok(order.indexOf("s1") < order.indexOf("s3"));
  assert.ok(order.indexOf("s2") < order.indexOf("s3"));
});

test("pipeline.toExecutionLevels", () => {
  const pipeline = createPipeline({
    id: "p1",
    intent: "x",
    tenantId: "t1",
    userId: "u1",
    status: PIPELINE_STATUS.CREATED,
    createdAt: new Date().toISOString(),
    steps: [
      { id: "s1", dependsOn: [] },
      { id: "s2", dependsOn: ["s1"] },
      { id: "s3", dependsOn: ["s1"] }
    ]
  });

  const levels = pipeline.toExecutionLevels();
  assert.equal(levels.length, 2);
  assert.deepEqual(levels[0].map((step) => step.id), ["s1"]);
  assert.deepEqual(levels[1].map((step) => step.id), ["s2", "s3"]);
});