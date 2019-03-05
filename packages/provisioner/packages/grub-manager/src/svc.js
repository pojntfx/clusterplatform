import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
  name: "grub-manager",
  actions: {
    createOverwrite: {
      params: {
        platform: "string",
        architecture: "string",
        extension: "string",
        label: "string",
        fragment: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing grub artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("grub-manager.create", {
          artifactId,
          progress: "0",
          status: "queued"
        });
        await this.createJob("grub-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "grub-worker.create",
          managerName: "grub-manager",
          service: this,
          artifact: "grub",
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
    name: "grub",
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
