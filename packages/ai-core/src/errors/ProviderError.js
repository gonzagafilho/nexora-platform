class ProviderError extends Error {
  constructor(message, code = "PROVIDER_ERROR", details = {}) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  ProviderError
};