function createPipelineStore() {
  const pipelines = new Map();

  function save(pipeline) {
    pipelines.set(pipeline.id, {
      ...pipeline,
      events: Array.isArray(pipeline.events) ? [...pipeline.events] : []
    });
    return get(pipeline.id);
  }

  function get(id) {
    const pipeline = pipelines.get(id);
    return pipeline ? { ...pipeline, events: [...pipeline.events] } : null;
  }

  function list(filter = {}) {
    return Array.from(pipelines.values())
      .filter((pipeline) => {
        if (filter.status && pipeline.status !== filter.status) {
          return false;
        }
        if (filter.tenantId && pipeline.tenantId !== filter.tenantId) {
          return false;
        }
        return true;
      })
      .map((pipeline) => ({ ...pipeline, events: [...pipeline.events] }));
  }

  function update(id, patch = {}) {
    const current = pipelines.get(id);
    if (!current) {
      return null;
    }

    const next = {
      ...current,
      ...patch,
      events: patch.events ? [...patch.events] : [...current.events]
    };
    pipelines.set(id, next);
    return get(id);
  }

  function appendEvent(id, event) {
    const current = pipelines.get(id);
    if (!current) {
      return null;
    }

    const next = {
      ...current,
      events: [...current.events, event]
    };
    pipelines.set(id, next);
    return get(id);
  }

  return {
    save,
    get,
    list,
    update,
    appendEvent
  };
}

module.exports = {
  createPipelineStore
};