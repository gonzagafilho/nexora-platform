function createNoopAdapter() {
  return {
    async create(record) {
      return { ...record };
    },
    async update() {
      return null;
    },
    async delete() {
      return false;
    },
    async findById() {
      return null;
    },
    async search() {
      return [];
    },
    async list() {
      return [];
    }
  };
}

module.exports = {
  createNoopAdapter
};