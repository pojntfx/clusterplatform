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
  settings: {
    entityValidator: {
      nodeId: "string"
    }
  }
};
