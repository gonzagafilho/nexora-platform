const test = require("node:test");
const assert = require("node:assert/strict");

const {
  searchByText,
  searchByTags,
  rankMemories,
  buildMemoryContext
} = require("../src");

const records = [
  {
    id: "1",
    title: "Financeiro VIP",
    content: "cliente com preferencia por boleto",
    tags: ["vip", "finance"],
    importance: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Atendimento",
    content: "duvida comum",
    tags: ["support"],
    importance: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

test("searchByText encontra por title", () => {
  const found = searchByText(records, "vip");
  assert.equal(found.length, 1);
  assert.equal(found[0].id, "1");
});

test("searchByText encontra por content", () => {
  const found = searchByText(records, "boleto");
  assert.equal(found.length, 1);
  assert.equal(found[0].id, "1");
});

test("searchByTags filtra por tag", () => {
  const found = searchByTags(records, ["support"]);
  assert.equal(found.length, 1);
  assert.equal(found[0].id, "2");
});

test("searchByTags sem tags retorna score zero", () => {
  const found = searchByTags(records, []);
  assert.equal(found.length, 2);
  assert.equal(found[0]._tagScore, 0);
});

test("ranking prioriza importance", () => {
  const ranked = rankMemories([
    { ...records[0], _textScore: 0, _tagScore: 0, importance: 5 },
    { ...records[1], _textScore: 2, _tagScore: 0, importance: 1 }
  ]);

  assert.equal(ranked[0].id, "1");
});

test("context window aplica maxItems", () => {
  const window = buildMemoryContext(records, { maxItems: 1, maxChars: 999 });
  assert.equal(window.items.length, 1);
  assert.equal(window.truncated, true);
});

test("context window aplica maxChars", () => {
  const huge = [
    { id: "a", title: "A", content: "1234567890" },
    { id: "b", title: "B", content: "1234567890" }
  ];

  const window = buildMemoryContext(huge, { maxItems: 5, maxChars: 12 });
  assert.equal(window.items.length, 1);
});