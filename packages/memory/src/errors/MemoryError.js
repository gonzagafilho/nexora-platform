class MemoryError extends Error {
  constructor(message, code = "MEMORY_ERROR", details = {}) {
    super(message);
    this.name = "MemoryError";
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  MemoryError
};