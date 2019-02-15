# Cluster Platform Provisioner

Hosts as a service.

## Features

- [DNS](./src/services/dns/dns.js): Use domains locally (with DNSMasq, configured using a `/etc/hosts`-like syntax)
- [Tunneling](./src/services/gateway/gateway.js): Expose your gateway globally without port forwarding or a VPN
- [Boot media](./src/services/provisioner/bootmedia.js): Generate ISOs for iPXE so that you can boot globally
  - [GRUB compiler](./src/services/provisioner/grub.js): UEFI Bootloader as a Service
  - [SYSLINUX compiler](./src/services/provisioner/syslinux.js): BIOS Bootloader as a Service
  - [iPXE compiler](./src/services/provisioner/ipxe.js): Network Bootloader as a Service
  - [ISO generator](./src/services/provisioner/iso.js): Bootable ISOs as a Service
- [PXE boot](./src/services/pxeboot/pxeboot.js): Distribute your OS over the network
  - [TFTP server and DHCP boot](./src/services/pxeboot/pxeboot.js): Serve the network bootloader (with DNSMasq)
  - [Main script](./src/services/pxeboot/pxeboot.js): Manage the script that should be embedded in the network bootloader
  - [Sub scripts](./src/services/provisioner/subscripts.js): A script that the embedded script can chain
  - [Kickstarts](./src/services/provisioner/kickstarts.js): Preseed scripts for Fedora/CentOS-based distributions
  - [Pre install scripts](./src/services/provisioner/preinstallscripts.js): A script (`sh`, `bash`, `node` or `python`, etc.) to run before the installation
  - [Post install scripts](./src/services/provisioner/postinstallscripts.js): A script (`sh`, `bash`, `node` or `python`, etc.) to run after the installation
- [Repo](./src/services/repo/repo-worker.js): Mirror the Fedora repositories locally

All the following features have been implemented as independent and horizontally scalable microservices. They are exposed using a REST API gateway.

## Usage

```bash
# Start development version in Docker
npm run dev
```

Now, you can either use the REST api directly on [localhost:3000/api](http://localhost:3000/api) or import the [Insomnia Export](./assets/insomnia.json) into [Insomnia](https://insomnia.rest/).

## Debugging

- If you're trying to start the DNS or PXE boot services, but you get an error like `dnsmasq: failed to bind DHCP server socket: Address already in use`, that means that your host is likely running `dnsmasq` itself. Try and run `pkill -9 dnsmasq` as `root` on the host to kill the process.
- If you send a script using URL parameters instead of a JSON body, don't escape `${...}` as `\${...}` manually or you will end up with very cryptic error messages and/or an instant reboot if you try to chain iPXE/the script with iPXE/GRUB/SYSLINUX!
- Booting can take some time. The following scripts for example take roughly 8 minutes to boot; this is because the entire install media is being downloaded:
  ```bash
  #!ipxe
  menu Choose Script
  item mainsubscriptserver_fedora29 Main Sub Script Server Fedora 29
  choose --default mainsubscriptserver_fedora29 --timeout 3000 server &&  goto ${server}
  :mainsubscriptserver_fedora29
  dhcp
  chain http://192.168.178.105:3000/api/pxeboot/subscripts/2
  ```
  ```bash
  #!ipxe
  menu Choose Script
  item subscript Fedora 29
  choose --default subscript --timeout 3000 subscript && goto ${subscript}
  :subscript
  dhcp
  set base http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os
  kernel ${base}/images/pxeboot/vmlinuz initrd=initrd.img repo=${base}
  initrd ${base}/images/pxeboot/initrd.img
  boot
  ```
  While it downloads the `initrd.img` and `vmlinuz` files quite quickly, downloading the `installer.img` and so on images after network configuration can take some time, and progress will not be shown. Just be patient!
- Due to an weird bug, `PUT`ing the `mainscript` can get stuck on the first time. Just restart the services once; it seems to be a problem with the NodeJS streams not `close`ing.

## More

See [Platform README](../../README.md).
