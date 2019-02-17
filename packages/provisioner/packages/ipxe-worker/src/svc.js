const Queue = require("moleculer-bull");

module.exports = {
  name: "ipxe-worker",
  queues: {
    "ipxe-worker.create": async function() {
      this.logger.info("Creating new Ipxe");
      this.Promise.resolve({ done: true });
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
