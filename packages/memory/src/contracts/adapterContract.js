const { MemoryError } = require("../errors/MemoryError");

function validateMemoryAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new MemoryError("Adapter must be an object", "INVALID_ADAPTER");
  }

  const methods = ["create", "update", "delete", "findById", "search", "list"];

  methods.forEach((method) => {
    if (typeof adapter[method] !== "function") {
      throw new MemoryError("Adapter method is required", "INVALID_ADAPTER_METHOD", {
        method
      });
    }
  });

  return true;
}

module.exports = {
  validateMemoryAdapter
};