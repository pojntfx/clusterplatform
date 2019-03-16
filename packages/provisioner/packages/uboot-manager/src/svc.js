import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
  name: "uboot-manager",
  actions: {
    createOverwrite: {
      params: {
        platform: "string",
        target: "string",
        fragment: "string",
        script: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing uboot artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("uboot-manager.create", {
          ...ctx.params,
          artifactId,
          progress: "0",
          status: "queued"
        });
        await this.createJob("uboot-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "uboot-worker.create",
          managerName: "uboot-manager",
          service: this,
          artifact: "uboot",
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
    name: "uboot",
    define: {
      platform: Orm.STRING,
      target: Orm.STRING,
      fragment: Orm.STRING,
      script: Orm.TEXT,
      artifactId: Orm.STRING,
      progress: Orm.STRING,
      status: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      platform: "string",
      target: "string",
      fragment: "string",
      script: "string",
      artifactId: "string",
      progress: "string",
      status: "string"
    }
  }
};
