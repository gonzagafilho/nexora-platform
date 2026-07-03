function createSkillEventEmitter() {
  const handlers = new Map();
  const history = [];

  function emit(eventName, payload = {}) {
    const event = {
      eventName,
      payload,
      timestamp: new Date().toISOString()
    };

    history.push(event);
    const subscriptions = handlers.get(eventName) || new Set();
    subscriptions.forEach((handler) => handler(event));
    return event;
  }

  function on(eventName, handler) {
    const subscriptions = handlers.get(eventName) || new Set();
    subscriptions.add(handler);
    handlers.set(eventName, subscriptions);
  }

  function off(eventName, handler) {
    const subscriptions = handlers.get(eventName);
    if (!subscriptions) {
      return;
    }
    subscriptions.delete(handler);
  }

  function listEvents() {
    return Array.from(handlers.keys());
  }

  function getHistory() {
    return [...history];
  }

  return {
    emit,
    on,
    off,
    listEvents,
    getHistory
  };
}

module.exports = {
  createSkillEventEmitter
};