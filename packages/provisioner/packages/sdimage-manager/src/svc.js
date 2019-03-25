import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
  name: "sdimage-manager",
  actions: {
    createOverwrite: {
      params: {
        label: "string",
        artifactsZipUrl: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing sdimage artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("sdimage-manager.create", {
          ...ctx.params,
          artifactId,
          progress: "0",
          status: "queued"
        });
        await this.createJob("sdimage-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "sdimage-worker.create",
          managerName: "sdimage-manager",
          service: this,
          artifact: "sdimage",
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
    name: "sdimage",
    define: {
      label: Orm.STRING,
      artifactsZipUrl: Orm.STRING,
      artifactId: Orm.STRING,
      progress: Orm.STRING,
      status: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      label: "string",
      artifactsZipUrl: "string",
      artifactId: "string",
      progress: "string",
      status: "string"
    }
  }
};
