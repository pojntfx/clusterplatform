const Gateway = require("moleculer-web");

module.exports = {
  name: "gateway",
  mixins: [Gateway],
  settings: {
    routes: [
      {
        path: "/api",
        whitelist: ["ipxe-manager.*"],
        aliases: {
          "POST /ipxes": "ipxe-manager.createOverwrite",
          "GET /ipxes": "ipxe-manager.list",
          "GET /ipxes/:id": "ipxe-manager.get",
          "DELETE /ipxes/:id": "ipxe-manager.get"
        }
      }
    ]
  }
};
