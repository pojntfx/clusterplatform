import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
  name: "rpi3patch-manager",
  actions: {
    createOverwrite: {
      params: {
        ixpeEfiUrl: "string",
        bootcodeBinUrl: "string",
        fixupDatUrl: "string",
        startElfUrl: "string",
        ubootBinUrl: "string",
        ubootCmdImgUrl: "string",
        script: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing rpi3patch artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("rpi3patch-manager.create", {
          ...ctx.params,
          artifactId,
          progress: "0",
          status: "queued"
        });
        await this.createJob("rpi3patch-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "rpi3patch-worker.create",
          managerName: "rpi3patch-manager",
          service: this,
          artifact: "rpi3patch",
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
    name: "rpi3patch",
    define: {
      ixpeEfiUrl: Orm.STRING,
      bootcodeBinUrl: Orm.STRING,
      fixupDatUrl: Orm.STRING,
      startElfUrl: Orm.STRING,
      ubootBinUrl: Orm.STRING,
      ubootCmdImgUrl: Orm.STRING,
      script: Orm.TEXT,
      artifactId: Orm.STRING,
      progress: Orm.STRING,
      status: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      ixpeEfiUrl: "string",
      bootcodeBinUrl: "string",
      fixupDatUrl: "string",
      startElfUrl: "string",
      ubootBinUrl: "string",
      ubootCmdImgUrl: "string",
      script: "string",
      artifactId: "string",
      progress: "string",
      status: "string"
    }
  }
};
