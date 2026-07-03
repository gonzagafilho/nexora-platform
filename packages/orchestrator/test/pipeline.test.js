const test = require("node:test");
const assert = require("node:assert/strict");

const { createPipelineStore, PIPELINE_STATUS } = require("../src");

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