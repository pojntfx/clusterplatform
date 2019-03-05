import Gateway from "moleculer-web";

export default {
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
          "bootruntime.*",
          "distributor-manager.*",
          "mainscripts.*",
          "subscripts.*",
          "kickstarts.*",
          "prebootscripts.*",
          "postbootscripts.*",
          "sshkeys.*"
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
          "PUT /bootruntimes/:id/iso": "bootruntime.createIso",
          "PUT /bootruntimes/:id/pxe": "bootruntime.createPxe",
          "PUT /bootruntimes/:id/pxe/status":
            "bootruntime.updateDistributorStatus",
          // distributors
          "POST /distributors": "distributor-manager.create",
          "GET /distributors": "distributor-manager.listOverwrite",
          "GET /distributors/:id": "distributor-manager.get",
          "DELETE /distributors/:id": "distributor-manager.remove",
          // mainscripts
          "POST /mainscripts": "mainscripts.create",
          "GET /mainscripts": "mainscripts.list",
          "GET /mainscripts/:id": "mainscripts.getOverwrite",
          "PUT /mainscripts/:id": "mainscripts.update",
          "DELETE /mainscripts/:id": "mainscripts.remove",
          // subscripts
          "POST /subscripts": "subscripts.create",
          "GET /subscripts": "subscripts.list",
          "GET /subscripts/:id": "subscripts.getOverwrite",
          "PUT /subscripts/:id": "subscripts.update",
          "DELETE /subscripts/:id": "subscripts.remove",
          // kickstarts
          "POST /kickstarts": "kickstarts.create",
          "GET /kickstarts": "kickstarts.list",
          "GET /kickstarts/:id": "kickstarts.getOverwrite",
          "PUT /kickstarts/:id": "kickstarts.update",
          "DELETE /kickstarts/:id": "kickstarts.remove",
          // prebootscripts
          "POST /prebootscripts": "prebootscripts.create",
          "GET /prebootscripts": "prebootscripts.list",
          "GET /prebootscripts/:id": "prebootscripts.getOverwrite",
          "PUT /prebootscripts/:id": "prebootscripts.update",
          "DELETE /prebootscripts/:id": "prebootscripts.remove",
          // postbootscripts
          "POST /postbootscripts": "postbootscripts.create",
          "GET /postbootscripts": "postbootscripts.list",
          "GET /postbootscripts/:id": "postbootscripts.getOverwrite",
          "PUT /postbootscripts/:id": "postbootscripts.update",
          "DELETE /postbootscripts/:id": "postbootscripts.remove",
          // sshkeys
          "POST /sshkeys": "sshkeys.create",
          "GET /sshkeys": "sshkeys.list",
          "GET /sshkeys/:id": "sshkeys.getOverwrite",
          "PUT /sshkeys/:id": "sshkeys.update",
          "DELETE /sshkeys/:id": "sshkeys.remove"
        }
      }
    ]
  }
};
