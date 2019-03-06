import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import Db from "moleculer-db";

export default {
  name: "localnodes",
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  actions: {
    listOverwrite: async function(ctx) {
      const nodes = (await ctx.call("localnodes.list")).rows;
      let nonPingableNodes = [];
      for (let node of nodes) {
        const distributor = (await ctx.call("distributor-manager.find", {
          query: { tag: node.tag }
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
          }
        }
      }
      for (let nonPinableNode of nonPingableNodes) {
        await ctx.call("localnodes.remove", { id: nonPinableNode.id });
      }
      return await ctx.call("localnodes.list");
    }
  },
  model: {
    name: "localnode",
    define: {
      ip: Orm.STRING,
      tag: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      ip: "string",
      tag: "string"
    }
  }
};
