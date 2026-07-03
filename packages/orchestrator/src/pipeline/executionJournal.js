const { createId } = require("../utils/createId");

function createExecutionJournal() {
  const entries = [];

  function append(type, message, data = {}) {
    const entry = {
      id: createId("journal"),
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    entries.push(entry);
    return entry;
  }

  function info(message, data) {
    return append("info", message, data);
  }

  function warn(message, data) {
    return append("warn", message, data);
  }

  function error(message, data) {
    return append("error", message, data);
  }

  function list() {
    return entries.map((entry) => ({ ...entry }));
  }

  function clear() {
    entries.length = 0;
  }

  return {
    append,
    info,
    warn,
    error,
    list,
    clear
  };
}

module.exports = {
  createExecutionJournal
};