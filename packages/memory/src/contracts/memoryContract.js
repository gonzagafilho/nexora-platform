const { MemoryError } = require("../errors/MemoryError");

const SUPPORTED_MEMORY_TYPES = [
  "tenant",
  "user",
  "project",
  "conversation",
  "event",
  "preference",
  "rule",
  "fact"
];

const SUPPORTED_VISIBILITY = ["private", "internal", "public"];
const SUPPORTED_SCOPES = ["tenant", "user", "project", "conversation"];

function validateMemoryRecord(record, options = {}) {
  const partial = options.partial === true;

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new MemoryError("Memory record must be an object", "INVALID_MEMORY_RECORD");
  }

  const requiredFields = ["tenantId", "projectKey", "appId", "scope", "type", "content"];

  if (!partial) {
    requiredFields.forEach((field) => {
      if (!record[field]) {
        throw new MemoryError(`Missing required field: ${field}`, "MISSING_REQUIRED_FIELD", { field });
      }
    });
  }

  if (record.scope && !SUPPORTED_SCOPES.includes(record.scope)) {
    throw new MemoryError("Invalid scope", "INVALID_SCOPE", { scope: record.scope });
  }

  if (record.type && !SUPPORTED_MEMORY_TYPES.includes(record.type)) {
    throw new MemoryError("Invalid type", "INVALID_TYPE", { type: record.type });
  }

  if (record.visibility && !SUPPORTED_VISIBILITY.includes(record.visibility)) {
    throw new MemoryError("Invalid visibility", "INVALID_VISIBILITY", { visibility: record.visibility });
  }

  if (record.tags && !Array.isArray(record.tags)) {
    throw new MemoryError("tags must be an array", "INVALID_TAGS");
  }

  if (record.importance !== undefined && typeof record.importance !== "number") {
    throw new MemoryError("importance must be a number", "INVALID_IMPORTANCE");
  }

  return true;
}

module.exports = {
  SUPPORTED_MEMORY_TYPES,
  SUPPORTED_VISIBILITY,
  SUPPORTED_SCOPES,
  validateMemoryRecord
};