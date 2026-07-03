const { SkillValidationError } = require("../errors/SkillValidationError");

function validatePayload(payload) {
  if (payload === null || payload === undefined) {
    return true;
  }

  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new SkillValidationError("Payload must be an object", "INVALID_PAYLOAD");
  }

  return true;
}

module.exports = {
  validatePayload
};