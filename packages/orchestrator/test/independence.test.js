const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const BLOCKED = [
  ["associacao", "-", "bolepix"].join(""),
  ["backend", "/", "src"].join(""),
  ["ex", "press"].join(""),
  ["mongo", "ose"].join(""),
  ["mongo", "db"].join(""),
  ["pm", "2"].join("")
];

function allJsFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...allJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

test("independence sem referencias proibidas", () => {
  const srcDir = path.resolve(__dirname, "../src");
  const testDir = path.resolve(__dirname, ".");
  const files = [...allJsFiles(srcDir), ...allJsFiles(testDir)];
  const violations = [];

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8").toLowerCase();
    BLOCKED.forEach((token) => {
      if (content.includes(token)) {
        violations.push({ filePath, token });
      }
    });
  });

  assert.equal(violations.length, 0);
});