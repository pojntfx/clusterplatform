const Db = require("moleculer-db");
const Adapter = require("moleculer-db-adapter-sequelize");
const Orm = require("sequelize");

module.exports = {
  name: "distributor-manager",
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "distributor",
    define: {
      nodeId: Orm.STRING
    }
  },
  actions: {
    listOverwrite: async function(ctx) {
      const allDistributors = (await ctx.call("distributor-manager.list")).rows;
      const nonPingableDistributors = [];
      for (distributor of allDistributors) {
        const pingable = await this.broker.ping(distributor.nodeId, 1000);
        if (!pingable) {
          nonPingableDistributors.push(distributor);
        }
      }
      for (distributor of nonPingableDistributors) {
        await ctx.call("distributor-manager.remove", {
          id: distributor.id
        });
      }
      return await ctx.call("distributor-manager.list");
    }
  },
  settings: {
    entityValidator: {
      nodeId: "string"
    }
  }
};
