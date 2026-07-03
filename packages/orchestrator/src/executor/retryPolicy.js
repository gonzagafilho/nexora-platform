async function executeWithRetry(executor, options = {}) {
  const retry = options.retry || 0;
  const onRetry = typeof options.onRetry === "function" ? options.onRetry : () => {};

  let attempt = 0;
  while (attempt <= retry) {
    try {
      return await executor(attempt);
    } catch (error) {
      if (attempt >= retry) {
        throw error;
      }
      onRetry(error, attempt + 1);
    }
    attempt += 1;
  }

  throw new Error("Unexpected retry flow");
}

module.exports = {
  executeWithRetry
};