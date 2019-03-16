import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
  name: "rpi3firmware-manager",
  actions: {
    createOverwrite: {
      params: {
        fragment: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing rpi3firmware artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("rpi3firmware-manager.create", {
          ...ctx.params,
          artifactId,
          progress: "0",
          status: "queued"
        });
        await this.createJob("rpi3firmware-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "rpi3firmware-worker.create",
          managerName: "rpi3firmware-manager",
          service: this,
          artifact: "rpi3firmware",
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
    name: "rpi3firmware",
    define: {
      fragment: Orm.STRING,
      artifactId: Orm.STRING,
      progress: Orm.STRING,
      status: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      fragment: "string",
      artifactId: "string",
      progress: "string",
      status: "string"
    }
  }
};
