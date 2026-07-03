function intentToPlan(input = {}) {
  const message = String(input.message || "").toLowerCase();
  const intent = input.intent || "default";

  if (message.includes("protocolo") || intent.includes("protocolo")) {
    return [{ tool: "protocol.list" }];
  }

  if (message.includes("whatsapp") || intent.includes("whatsapp")) {
    return [{ tool: "notification.whatsapp" }];
  }

  if (message.includes("relat") || intent.includes("report")) {
    return [{ tool: "report.generatepdf" }];
  }

  if (message.includes("associad") || intent.includes("associate")) {
    return [{ tool: "associate.list" }];
  }

  return [{ tool: "noop.plan" }];
}

module.exports = {
  intentToPlan
};