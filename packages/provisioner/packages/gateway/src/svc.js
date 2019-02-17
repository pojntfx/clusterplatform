const Gateway = require("moleculer-web");

module.exports = {
  name: "gateway",
  mixins: [Gateway],
  settings: {
    routes: [
      {
        path: "/api",
        whitelist: ["ipxe-manager.create"],
        aliases: {
          "POST /ipxes": "ipxe-manager.create"
        }
      }
    ]
  }
};
