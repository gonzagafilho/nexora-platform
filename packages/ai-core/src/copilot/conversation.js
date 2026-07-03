function createConversation(initialMessages = []) {
  const messages = Array.isArray(initialMessages) ? [...initialMessages] : [];

  function addMessage(message) {
    const record = {
      role: message.role || "user",
      content: message.content || "",
      timestamp: message.timestamp || new Date().toISOString()
    };

    messages.push(record);
    return record;
  }

  function listMessages() {
    return [...messages];
  }

  function clear() {
    messages.length = 0;
  }

  function getLastMessage() {
    return messages[messages.length - 1] || null;
  }

  return {
    addMessage,
    listMessages,
    clear,
    getLastMessage
  };
}

module.exports = {
  createConversation
};