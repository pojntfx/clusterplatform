const Queue = require("moleculer-bull");
const Db = require("moleculer-db");
const Adapter = require("moleculer-db-adapter-sequelize");
const Orm = require("sequelize");
const uuidv1 = require("uuid/v1");
const { syncQueueWithDb } = require("@clusterplatform/builder-utils");

module.exports = {
  name: "ipxe-manager",
  actions: {
    createOverwrite: {
      params: {
        script: "string",
        platform: "string",
        driver: "string",
        extension: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing Ipxe artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("ipxe-manager.create", {
          artifactId,
          progress: "0",
          status: "preparing"
        });
        await this.createJob("ipxe-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "ipxe-worker.create",
          managerName: "ipxe-manager",
          service: this,
          artifact: "ipxe",
          ctx
        });
        return jobInDb;
      }
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
  adapter: new Adapter(process.env.POSTGRES_URI),
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
