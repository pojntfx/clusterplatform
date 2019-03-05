import Queue from "moleculer-bull";
import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import uuidv1 from "uuid/v4";
import { syncQueueWithDb } from "@clusterplatform/builder-utils";

export default {
  name: "iso-manager",
  actions: {
    createOverwrite: {
      params: {
        label: "string",
        ipxeUefiUrl: "string",
        ipxeBiosUrl: "string",
        grubImgUrl: "string",
        grubEfiX64Url: "string",
        grubEfiX86Url: "string",
        ldLinuxUrl: "string",
        isolinuxBinUrl: "string",
        isohdpfxBinUrl: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        await this.logger.info("Queueing iso artifact creation", {
          ...ctx.params,
          artifactId
        });
        const jobInDb = await ctx.call("iso-manager.create", {
          artifactId,
          progress: "0",
          status: "queued"
        });
        await this.createJob("iso-worker.create", {
          ...ctx.params,
          artifactId
        });
        await syncQueueWithDb({
          queueName: "iso-worker.create",
          managerName: "iso-manager",
          service: this,
          artifact: "iso",
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
    name: "iso",
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
