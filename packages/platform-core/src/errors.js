class PlatformError extends Error {
  constructor(message, options = {}) {
    super(String(message || "Platform error"));
    this.name = "PlatformError";
    this.code = options.code || "PLATFORM_ERROR";
    this.statusCode = Number(options.statusCode || 500);
    this.details = options.details || null;
  }
}

module.exports = {
  PlatformError
};
