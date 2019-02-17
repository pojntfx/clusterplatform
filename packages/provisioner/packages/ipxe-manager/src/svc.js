const Queue = require("moleculer-bull");
const Db = require("moleculer-db");
const Adapter = require("moleculer-db-adapter-sequelize");
const Orm = require("sequelize");
const uuidv1 = require("uuid/v1");

module.exports = {
  name: "ipxe-manager",
  actions: {
    createOverwrite: async function(ctx) {
      const artifactId = uuidv1();
      const jobInDb = await ctx.call("ipxe-manager.create", {
        artifactId,
        progress: "0",
        status: "preparing"
      });
      await this.createJob("ipxe-worker.create", {
        artifactId
      });
      const queue = await this.getQueue("ipxe-worker.create");
      queue.on("global:progress", async (jobInQueueId, progress) => {
        const jobInQueue = await queue.getJob(jobInQueueId);
        await this.logger.info(
          "Progress on Ipxe artifact",
          jobInQueue.data.artifactId,
          progress
        );
        const jobInDb = (await ctx.call("ipxe-manager.find", {
          query: {
            artifactId: jobInQueue.data.artifactId
          }
        }))[0];
        await ctx.call("ipxe-manager.update", {
          id: jobInDb.id,
          artifactId: jobInQueue.data.artifactId,
          progress,
          status: "working"
        });
      });
      queue.on("global:completed", async (jobInQueueId, res) => {
        const jobInQueue = await queue.getJob(jobInQueueId);
        await this.logger.info(
          "Ipxe artifact done",
          jobInQueue.data.artifactId,
          res
        );
        const jobInDb = (await ctx.call("ipxe-manager.find", {
          query: {
            artifactId: jobInQueue.data.artifactId
          }
        }))[0];
        await ctx.call("ipxe-manager.update", {
          id: jobInDb.id,
          artifactId: jobInQueue.data.artifactId,
          status: "done"
        });
      });
      return jobInDb;
    }
  },
  mixins: [
    Queue({
      redis: {
        host: process.env.REDIS_HOST
      }
    }),
    Db
  ],
  adapter: new Adapter(process.env.POSTGRESQL_URI),
  model: {
    name: "ipxe",
    define: {
      artifactId: Orm.STRING,
      progress: Orm.STRING,
      status: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      artifactId: "string",
      progress: "string",
      status: "string"
    }
  }
};
