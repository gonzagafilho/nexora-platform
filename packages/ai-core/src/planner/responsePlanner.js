function createResponsePlanner() {
  function createPlan(input = {}) {
    const intent = input.intent || "answer";
    const skills = Array.isArray(input.skills) ? input.skills : [];

    return {
      intent,
      steps: [
        "analyze-input",
        skills.length ? "apply-skills" : "skip-skills",
        "generate-response",
        "validate-response"
      ],
      metadata: {
        skillCount: skills.length,
        project: input.project || null
      }
    };
  }

  return {
    createPlan
  };
}

module.exports = {
  createResponsePlanner
};