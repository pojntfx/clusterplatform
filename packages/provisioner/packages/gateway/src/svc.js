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
          "iso-manager.*",
          "bootruntime.*"
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
          // isos
          "POST /isos": "iso-manager.createOverwrite",
          "GET /isos": "iso-manager.list",
          "GET /isos/:id": "iso-manager.get",
          "DELETE /isos/:id": "iso-manager.remove",
          // bootruntimes
          "POST /bootruntimes": "bootruntime.createOverwrite",
          "GET /bootruntimes": "bootruntime.list",
          "GET /bootruntimes/:id": "bootruntime.get",
          "DELETE /bootruntimes/:id": "bootruntime.remove",
          "PUT /bootruntimes/:id/iso": "bootruntime.createIso"
        }
      }
    ]
  }
};
