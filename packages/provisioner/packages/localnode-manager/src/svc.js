import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import Db from "moleculer-db";

export default {
  name: "localnode-manager",
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  actions: {
    listOverwrite: async function(ctx) {
      const nodes = (await ctx.call("localnode-manager.list")).rows;
      let nonPingableNodes = [];
      let pingableNodes = [];
      for (let node of nodes) {
        const distributor = (await ctx.call("distributor-manager.find", {
          query: { artifactId: node.artifactId }
        }))[0];
        if (!distributor) {
          nonPingableNodes.push(node);
        } else {
          const pingable = await ctx.call(
            "distributor-manager.pingNodeFromDistributorWorker",
            {
              nodeIp: node.ip,
              distributorId: distributor.id
            }
          );
          if (!pingable) {
            nonPingableNodes.push(node);
          } else {
            pingableNodes.push(node);
          }
        }
      }
      for (let nonPingableNode of nonPingableNodes) {
        await ctx.call("localnode-manager.update", {
          id: nonPingableNode.id,
          pingable: false
        });
      }
      for (let pingableNode of pingableNodes) {
        await ctx.call("localnode-manager.update", {
          id: pingableNode.id,
          pingable: true
        });
      }
      return await ctx.call("localnode-manager.list", ctx.params);
    }
  },
  model: {
    name: "localnode",
    define: {
      ip: { type: Orm.STRING, unique: "ipsOnlyOnceInDatacenter" },
      artifactId: { type: Orm.STRING, unique: "ipsOnlyOnceInDatacenter" },
      pingable: Orm.BOOLEAN
    }
  },
  settings: {
    entityValidator: {
      ip: "string",
      artifactId: "string",
      pingable: { type: "boolean", convert: true }
    }
  }
};
