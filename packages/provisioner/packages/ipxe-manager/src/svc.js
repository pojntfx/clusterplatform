import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
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
        await this.logger.info("Queueing ipxe artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("ipxe-manager.create", {
          artifactId,
          progress: "0",
          status: "queued"
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
