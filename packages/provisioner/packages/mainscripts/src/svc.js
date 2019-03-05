import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import Db from "moleculer-db";

export default {
  name: "mainscripts",
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "mainscripts",
    define: {
      text: Orm.TEXT
    }
  },
  settings: {
    entityValidator: {
      text: "string"
    }
  }
};
