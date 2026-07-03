function createInMemoryAdapter(initialRecords = []) {
  const records = new Map();

  initialRecords.forEach((record) => {
    records.set(record.id, { ...record });
  });

  return {
    async create(record) {
      records.set(record.id, { ...record });
      return { ...record };
    },
    async update(id, patch) {
      const current = records.get(id);
      if (!current) {
        return null;
      }

      const updated = {
        ...current,
        ...patch,
        updatedAt: patch.updatedAt || new Date().toISOString()
      };

      records.set(id, updated);
      return { ...updated };
    },
    async delete(id) {
      return records.delete(id);
    },
    async findById(id) {
      const record = records.get(id);
      return record ? { ...record } : null;
    },
    async search(query = {}, context = {}) {
      const all = Array.from(records.values());
      return all.filter((item) => {
        if (context.tenantId && item.tenantId !== context.tenantId) {
          return false;
        }

        if (query.scope && item.scope !== query.scope) {
          return false;
        }

        if (query.type && item.type !== query.type) {
          return false;
        }

        return true;
      });
    },
    async list(context = {}) {
      const all = Array.from(records.values());

      if (!context.tenantId) {
        return all;
      }

      return all.filter((item) => item.tenantId === context.tenantId);
    }
  };
}

module.exports = {
  createInMemoryAdapter
};