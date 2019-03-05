import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
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
          status: "queued"
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
