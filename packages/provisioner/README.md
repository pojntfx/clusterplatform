# Cluster Platform Provisioner

Hosts as a service.

## Features

- Subartifact Builders: Services that build lower-level artifacts
  - [iPXE](./packages/ipxe-manager/src/svc.js): UEFI and BIOS network bootloader as a service
  - [GRUB](./packages/grub-manager/src/svc.js): UEFI boot media bootloader as a service
  - [SYSLINUX](./packages/syslinux-manager/src/svc.js): BIOS boot media bootloader as a service
- Mainartifact Builders/Distributors: Services that build or distribute higher-level artifacts
  - [ISO](./packages/iso-manager/src/svc.js): Bootable ISOs as a service
  - [Distributor](./packages/distributor-manager/src/svc.js): PXEBoot server as a service
- [Boot Runtime](./packages/bootruntime/src/svc.js): Simple meta service for all the above

All these services have been implemented as individual, horizontally scalable microservices; this means that parallel builds, a seperate build and distributor infrastructure etc. is possible. You can, for example, run the build services in a powerful cloud Kubernetes cluster, but run the distributor in the local network using plain Docker, Minikube or a local Kubernetes cluster - the possibilities are endless! All services don't require a public IP address, so you don't even need to set up port forwarding for such a use case (this excludes the `minio`, `nats`, `postgres`, `redis` and `verdaccio` services). See below for an example.

## Usage

### Run Services

```bash
cd ../../ && skaffold dev -p provisioner--dev
```

### Create Bootruntime

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"label":"Cluster Platform Boot Media","script":"#!ipxe\ndhcp\nchain http://46.101.114.216:30300/api/mainscripts/1","isoArtifacts":false,"pxeArtifacts":true}' \
http://46.101.114.216:30300/api/bootruntimes
```

### Create Mainscript

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text":"#!ipxe\nmenu Choose Script\nitem mainsubscriptserver_fedora29 Main Sub Script Server Fedora 29\nchoose --default mainsubscriptserver_fedora29 --timeout 3000 server &&  goto ${server}\n:mainsubscriptserver_fedora29\nchain http://46.101.114.216:30300/api/subscripts/1"}' \
http://46.101.114.216:30300/api/mainscripts
```

### Create Subscript

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text":"#!ipxe\nmenu Choose Script\nitem subscript Fedora 29\nchoose --default subscript --timeout 3000 subscript && goto ${subscript}\n:subscript\nset base http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\nkernel ${base}/images/pxeboot/vmlinuz initrd=initrd.img inst.repo=${base} inst.ks=http://46.101.114.216:30300/api/kickstarts/1\ninitrd ${base}/images/pxeboot/initrd.img\nboot\n"}' \
http://46.101.114.216:30300/api/subscripts
```

### Add SSH Key

You can get your SSH key with `cat ~/.ssh/id_rsa.pub`. We will not use this right here (as the first SSH key will be specified in the kickstart file), but you'll want to use this SSH key later on.

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text":"ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0DLQNNfDrcjrqEiIuDXcTWNhO7Hg5eMosrsjW0HDndC+cNjQ+RAMGWEy50PtvTnujXtnl1kXBdzS2dNVmtanBPKt0B4Dl3WmgaO3LNv72Bj2pLnF8ZcSE6WRcvW4TghzRp2akYaNyV2cRID/9nEv6uOXf7aRWGYAxpMYX/JuuIEorY6OshV/OfM5EgPJTWhnD33dy6yeafHproG23PpXRG2hGItEtzSuq6bJohJKZmeP/sila3WSyr40DIojW7d533gys10kDkEa173I762dkbxjIlJC5RyN1xAVIDk3wWATRkDOZzHyeR0ZcSXGJ6/lquhfteHnsaDtdiPnz2f8D pojntfx@linux.fritz.box"}' \
http://46.101.114.216:30300/api/sshkeys
```

### Create Kickstart

A nice visual visual tool for this is `system-config-kickstart`.
You can get your SSH key with `cat ~/.ssh/id_rsa.pub`.

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text":"#platform=x86, AMD64, or Intel EM64T\n#version=DEVEL\n# Keyboard layouts\nkeyboard us\n# Root password\nrootpw --plaintext asdfasdf123$$44\nsshkey --username=root \"ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0DLQNNfDrcjrqEiIuDXcTWNhO7Hg5eMosrsjW0HDndC+cNjQ+RAMGWEy50PtvTnujXtnl1kXBdzS2dNVmtanBPKt0B4Dl3WmgaO3LNv72Bj2pLnF8ZcSE6WRcvW4TghzRp2akYaNyV2cRID/9nEv6uOXf7aRWGYAxpMYX/JuuIEorY6OshV/OfM5EgPJTWhnD33dy6yeafHproG23PpXRG2hGItEtzSuq6bJohJKZmeP/sila3WSyr40DIojW7d533gys10kDkEa173I762dkbxjIlJC5RyN1xAVIDk3wWATRkDOZzHyeR0ZcSXGJ6/lquhfteHnsaDtdiPnz2f8D pojntfx@linux.fritz.box\"\n# System language\nlang en_US\n# Reboot after installation\nreboot\n# System timezone\ntimezone Europe/Berlin\n# Use text mode install\ntext\n# Network information\nnetwork  --bootproto=dhcp --device=enp0s25\n# Use network installation\nurl --url=\"http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\"\n# System authorization information\nauth  --useshadow  --passalgo=sha512\n# Firewall configuration\nfirewall --disabled\n# SELinux configuration\nselinux --enforcing\n# Do not configure the X Window System\nskipx\n\n# System bootloader configuration\nbootloader --location=mbr\n# Clear the Master Boot Record\nzerombr\n# Partition clearing information\nclearpart --all\n# Disk partitioning information\npart /boot --asprimary --fstype=\"ext4\" --size=512\npart / --asprimary --fstype=\"ext4\" --grow --size=1\n\n%pre\ncurl http://46.101.114.216:30300/api/prebootscripts/1 | bash\n%end\n\n%post\ncurl http://46.101.114.216:30300/api/postbootscripts/1 | bash\n%end\n\n%packages\n@standard\n\n%end\n"}' \
http://46.101.114.216:30300/api/kickstarts
```

### Create Preboot Script

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text":"echo \"This could be the Preboot Script!\""}' \
http://46.101.114.216:30300/api/prebootscripts
```

### Create Postboot Script

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text": "sudo dnf install openssh-server -y;\nmkdir -p ~/.ssh;\nsystemctl enable sshd;\nip=$(echo $(ip -4 addr show | grep -Eo \"inet (addr:)?([0-9]*\\.){3}[0-9]*\" | grep -Eo \"([0-9]*\\.){3}[0-9]*\" | grep -v \"127.0.0.1\") | cut -d \" \" -f 1);\ncurl --request POST \"http://46.101.114.216:30300/api/localnodes?ip=${ip}&tag=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local\"\n"}' \
http://46.101.114.216:30300/api/postbootscripts
```

### Run Distributor(s)

Run this on a node/multiple nodes that is/are in the same network as the hosts you want to provision. You may run as many instances of `distributor-worker` as you like; when deploying a bootruntime, all distributors with the specified `CLUSTERPLATFORM_DISTRIBUTOR_TAG` will be used.

```bash
docker run --env TRANSPORTER=nats://46.101.114.216:30002 --env NPM_USER=verdaccio-user --env NPM_PASS=verdaccio-password --env NPM_EMAIL=verdaccio-user@example.com --env NPM_REGISTRY=http://46.101.114.216:30004 --env CLUSTERPLATFORM_DISTRIBUTOR_TAG=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local --cap-add=NET_ADMIN --net=host registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:ed60ca9-dirty
```

### Get Bootruntime Status

Both should include `"progress":"100"`.

```bash
curl http://46.101.114.216:30300/api/ipxes/1
curl http://46.101.114.216:30300/api/ipxes/2
```

### Get Distributor(s)

Look for whether the `CLUSTERPLATFORM_DISTRIBUTOR_TAG` from above can be seen here.

```bash
curl http://46.101.114.216:30300/api/distributors
```

### Deploy Bootruntime to Distributor(s)

```bash
curl \
--request PUT \
--header "Content-Type: application/json" \
--data '{"distributorTags":["sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local"],"device":"enp0s25","range":"192.168.178.1"}' \
http://46.101.114.216:30300/api/bootruntimes/1/pxe
```

### Activate Distributor(s)

If the following does not work, make sure the host is not running `dnsmasq` itself; check this with `ss -tlnp | grep :53`. If it is, kill it with `sudo pkill -9 dnsmasq`.

```bash
curl \
--request PUT \
--header "Content-Type: application/json" \
--data '{"on":false}' \
http://46.101.114.216:30300/api/bootruntimes/1/pxe/status
```

```bash
curl \
--request PUT \
--header "Content-Type: application/json" \
--data '{"on":true}' \
http://46.101.114.216:30300/api/bootruntimes/1/pxe/status
```

Now, connect hosts to the network, set them to `Network Boot` and turn them on; they will perform a fully automated installation and be exposed using the root password that you've set above as well as the SSH key. In the future, they will `POST` to a `localnode-manager` for easy gathering of the IPs.
If you are using VirtualBox VMs, set `Network` / `Adapter 1` / `Attached to` to `Bridged Adapter` and `Name` to the network interface the distributor uses (probably `enp0s25`). Also, set `System` / `Motherboard` / `Base Memory` to at least `1500 MB`; otherwise the install will fail because the ramdisk would be to big to fit into the RAM.

## Technical Overview

```bash
# Run development version in Kubernetes
cd ../../ && skaffold dev -p provisioner--dev
```

Now, you can either use the REST api directly on [localhost:3000/api](http://localhost:3000/api) or import the [Insomnia Export](./packages/insomnia/src/workspace.json) into [Insomnia](https://insomnia.rest/).

If you want to run a `distributor-worker` standalone and then connect to the rest of the services (i.e. to provision machines in your home network, a remote location etc. while still doing all the heavy lifting (i.e. building the necessary artifacts) in a powerful cloud Kubernetes cluster), run the following:

```bash
docker run --env TRANSPORTER=nats://46.101.114.216:30002 --env NPM_USER=verdaccio-user --env NPM_PASS=verdaccio-password --env NPM_EMAIL=verdaccio-user@example.com --env NPM_REGISTRY=http://46.101.114.216:30004 --env CLUSTERPLATFORM_DISTRIBUTOR_TAG=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local --cap-add=NET_ADMIN --net=host registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:ed60ca9-dirty
```

Artifacts can be downloaded from `http://46.101.114.216:30900/${artifactName}/${artifactId}/${filename}`, where `46.101.114.216` is one of the Kubernetes nodes' IP, `${artifactName}` is the plural of an artifact such as `grubs` or `syslinuxs`, `{artifactId}` is the artifact's ID which can be found using the corresponding artifact's REST endpoint and `${filename}` is the actual file's name, such as `ipxe.efi`.

## More

See [Home](../site/src/index.md).
