import Gateway from "moleculer-web";

export default {
  name: "gateway",
  mixins: [Gateway],
  settings: {
    routes: [
      {
        path: "/api",
        whitelist: [
          // ipxes
          "ipxe-manager.createOverwrite",
          "ipxe-manager.list",
          "ipxe-manager.get",
          // grubs
          "grub-manager.createOverwrite",
          "grub-manager.list",
          "grub-manager.get",
          // syslinuxs
          "syslinux-manager.createOverwrite",
          "syslinux-manager.list",
          "syslinux-manager.get",
          // isos
          "iso-manager.createOverwrite",
          "iso-manager.list",
          "iso-manager.get",
          // distributors
          "distributor-manager.create",
          "distributor-manager.updateDistributor",
          "distributor-manager.updateDistributorStatus",
          "distributor-manager.listOverwrite",
          // mainscripts
          "mainscripts.create",
          "mainscripts.list",
          // subscripts
          "subscripts.create",
          "subscripts.list",
          // kickstarts
          "kickstarts.create",
          "kickstarts.list",
          // prebootscripts
          "prebootscripts.create",
          "prebootscripts.list",
          // postbootscripts
          "postbootscripts.create",
          "postbootscripts.list",
          // sshkeys
          "sshkeys.create",
          "sshkeys.list",
          // localnodes
          "localnode-manager.create",
          "localnode-manager.expose",
          "localnode-manager.listOverwrite"
        ],
        aliases: {
          // ipxes
          "POST /ipxes": "ipxe-manager.createOverwrite",
          "GET /ipxes": "ipxe-manager.list",
          "GET /ipxes/:id": "ipxe-manager.get",
          // grubs
          "POST /grubs": "grub-manager.createOverwrite",
          "GET /grubs": "grub-manager.list",
          "GET /grubs/:id": "grub-manager.get",
          // syslinuxs
          "POST /syslinuxs": "syslinux-manager.createOverwrite",
          "GET /syslinuxs": "syslinux-manager.list",
          "GET /syslinuxs/:id": "syslinux-manager.get",
          // isos
          "POST /isos": "iso-manager.createOverwrite",
          "GET /isos": "iso-manager.list",
          "GET /isos/:id": "iso-manager.get",
          // distributors
          "POST /distributors": "distributor-manager.create",
          "PUT /distributors/:id": "distributor-manager.updateDistributor",
          "PUT /distributors/:id/status":
            "distributor-manager.updateDistributorStatus",
          "GET /distributors": "distributor-manager.listOverwrite",
          // mainscripts
          "POST /mainscripts": "mainscripts.create",
          "GET /mainscripts": "mainscripts.list",
          // subscripts
          "POST /subscripts": "subscripts.create",
          "GET /subscripts": "subscripts.list",
          // kickstarts
          "POST /kickstarts": "kickstarts.create",
          "GET /kickstarts": "kickstarts.list",
          // prebootscripts
          "POST /prebootscripts": "prebootscripts.create",
          "GET /prebootscripts": "prebootscripts.list",
          // postbootscripts
          "POST /postbootscripts": "postbootscripts.create",
          "GET /postbootscripts": "postbootscripts.list",
          // sshkeys
          "POST /sshkeys": "sshkeys.create",
          "GET /sshkeys": "sshkeys.list",
          // localnodes
          "POST /localnodes": "localnode-manager.create",
          "PUT /localnodes/:id/vpn": "localnode-manager.expose",
          "GET /localnodes": "localnode-manager.listOverwrite"
        }
      }
    ]
  }
};
