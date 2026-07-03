class AIError extends Error {
  constructor(message, code = "AI_ERROR", details = {}) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  AIError
};