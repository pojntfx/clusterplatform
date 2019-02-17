const Queue = require("moleculer-bull");

module.exports = {
  name: "ipxe-manager",
  actions: {
    create: async function() {
      this.createJob("ipxe-worker.create");
    }
  },
  mixins: [
    Queue({
      redis: {
        host: process.env.REDIS_HOST
      }
    })
  ]
};
