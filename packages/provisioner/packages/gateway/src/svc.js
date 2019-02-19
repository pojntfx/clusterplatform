const Gateway = require("moleculer-web");

module.exports = {
  name: "gateway",
  mixins: [Gateway],
  settings: {
    routes: [
      {
        path: "/api",
        whitelist: [
          "ipxe-manager.*",
          "grub-manager.*",
          "syslinux-manager.*",
          "bootmedium.*"
        ],
        aliases: {
          // ipxes
          "POST /ipxes": "ipxe-manager.createOverwrite",
          "GET /ipxes": "ipxe-manager.list",
          "GET /ipxes/:id": "ipxe-manager.get",
          "DELETE /ipxes/:id": "ipxe-manager.remove",
          // grubs
          "POST /grubs": "grub-manager.createOverwrite",
          "GET /grubs": "grub-manager.list",
          "GET /grubs/:id": "grub-manager.get",
          "DELETE /grubs/:id": "grub-manager.remove",
          // syslinuxs
          "POST /syslinuxs": "syslinux-manager.createOverwrite",
          "GET /syslinuxs": "syslinux-manager.list",
          "GET /syslinuxs/:id": "syslinux-manager.get",
          "DELETE /syslinuxs/:id": "syslinux-manager.remove",
          // bootmediums
          "POST /bootmediums": "bootmedium.createOverwrite",
          "GET /bootmediums": "bootmedium.list",
          "GET /bootmediums/:id": "bootmedium.get",
          "DELETE /bootmediums/:id": "bootmedium.remove"
        }
      }
    ]
  }
};
