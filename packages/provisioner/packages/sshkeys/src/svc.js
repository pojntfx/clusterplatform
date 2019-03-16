import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import Db from "moleculer-db";

export default {
  name: "sshkeys",
  actions: {
    getOverwrite: {
      params: {
        id: "string"
      },
      handler: async function(ctx) {
        const res = await ctx.call("sshkeys.get", {
          id: ctx.params.id
        });
        ctx.meta.$responseType = "text/plain";
        return res.text;
      }
    }
  },
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "sshkey",
    define: {
      text: Orm.TEXT,
      artifactId: Orm.STRING
    }
  },
  settings: {
    entityValidator: {
      text: "string",
      artifactId: "string"
    }
  }
};
