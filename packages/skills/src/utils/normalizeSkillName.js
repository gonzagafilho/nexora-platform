function normalizeSkillName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\.\./g, ".");
}

module.exports = {
  normalizeSkillName
};