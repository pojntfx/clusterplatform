import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";

export default {
  name: "distributor-manager",
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "distributor",
    define: {
      nodeId: Orm.STRING,
      tag: Orm.STRING
    }
  },
  actions: {
    listOverwrite: async function(ctx) {
      const allDistributors = (await ctx.call("distributor-manager.list")).rows;
      const nonPingableDistributors = [];
      for (let distributor of allDistributors) {
        const pingable = await this.broker.ping(distributor.nodeId, 5000);
        if (!pingable) {
          nonPingableDistributors.push(distributor);
        }
      }
      for (let distributor of nonPingableDistributors) {
        await ctx.call("distributor-manager.remove", {
          id: distributor.id
        });
      }
      return await ctx.call("distributor-manager.list");
    },
    updateDistributor: {
      params: {
        ipxePxeUefiUrl: "string",
        ipxePxeBiosUrl: "string",
        artifactId: "number",
        id: "number",
        device: "string",
        range: "string"
      },
      handler: async function(ctx) {
        const distributor = await ctx.call("distributor-manager.get", {
          id: ctx.params.id
        });
        await ctx.call("distributor-worker.update", ctx.params, {
          nodeID: distributor.nodeId
        });
        return distributor;
      }
    },
    updateDistributorStatus: {
      params: {
        id: { type: "number", convert: true },
        artifactId: { type: "number", convert: true },
        on: "boolean"
      },
      handler: async function(ctx) {
        const distributor = await ctx.call("distributor-manager.get", {
          id: ctx.params.id
        });
        await ctx.call("distributor-worker.updateStatus", ctx.params, {
          nodeID: distributor.nodeId
        });
        return distributor;
      }
    },
    updateDistributorStatus: {
      params: {
        id: { type: "number", convert: true },
        artifactId: { type: "number", convert: true },
        on: "boolean"
      },
      handler: async function(ctx) {
        const distributor = await ctx.call("distributor-manager.get", {
          id: ctx.params.id
        });
        await ctx.call("distributor-worker.updateStatus", ctx.params, {
          nodeID: distributor.nodeId
        });
        return distributor;
      }
    },
    pingNodeFromDistributorWorker: {
      params: {
        nodeIp: "string",
        distributorId: { type: "number", convert: true }
      },
      handler: async function(ctx) {
        const distributor = await ctx.call("distributor-manager.get", {
          id: ctx.params.distributorId
        });
        return await ctx.call("distributor-worker.pingNode", ctx.params, {
          nodeID: distributor.nodeId
        });
      }
    }
  },
  settings: {
    entityValidator: {
      nodeId: "string",
      tag: "string"
    }
  }
};
