const Queue = require("moleculer-bull");
const Db = require("moleculer-db");
const Adapter = require("moleculer-db-adapter-sequelize");
const Orm = require("sequelize");
const uuidv1 = require("uuid/v4");
const { syncQueueWithDb } = require("@clusterplatform/builder-utils");

module.exports = {
  name: "syslinux-manager",
  actions: {
    createOverwrite: {
      params: {
        fragment: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing syslinux artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("syslinux-manager.create", {
          artifactId,
          progress: "0",
          status: "preparing"
        });
        await this.createJob("syslinux-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "syslinux-worker.create",
          managerName: "syslinux-manager",
          service: this,
          artifact: "syslinux",
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
    name: "syslinux",
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
