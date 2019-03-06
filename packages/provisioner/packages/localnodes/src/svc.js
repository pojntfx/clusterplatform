import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import Db from "moleculer-db";

export default {
  name: "localnodes",
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
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
