# Cluster Platform Provisioner

![Cluster Platform Provisioner logo](./assets/logo.webp)

Nodes as a service.

## Features

### Introduction

The Cluster Platform Provisioner turns a physical or virtual host (i.e. a server, virtual machine, laptop, ...) into a locally or globally SSH accessible node by using a distributed, scalable system. You only have to run one docker container in the network that the hosts are if you are using the network distribution method or none if you are using the media distribution method; all the heavy lifting can be done in a nearly infinitly horizontally and vertically scalable Kubernetes cluster.

### Diagram

```plaintext
+-----------------------------------------------------+                                                                         +----------------------------------------------+
|                                                     |            +-----------------------------------------------+            |                                              |
|                      ## Hosts                       |            |                                               |            |                  ## Nodes                    |
|                                                     |  +------>  | Distributor(s) and other provisioner services |  +------>  |                                              |
| (Servers, virtual machines, laptops with BIOS/UEFI) |            |                                               |            | (With local and/or global ip and SSH access) |
|                                                     |            +-----------------------------------------------+            |                                              |
+-----------------------------------------------------+                                                                         +----------------------------------------------+

+----------+
|          |
| Server 1 +------------+                                                             +-----------------------------------------------------+
|          |            |                                                             |                                                     |
+----------+            |                                                             | [                                                   |
                        |                                                             |     {                                               |
+------------+          |                                                             |         "id": 1,                                    |
|            |          |                                                             |         "artifactId": "felicitas.pojtinger.swabia.sol", |
| Computer 1 +----------+                                                             |         "ip": "192.168.178.152",                    |
|            |          |   +-----------------------------------------------------+   |         "pingable": true                            |
+------------+          |   |                                                     |   |     },                                              |
                        |   | [                                                   |   |     {                                               |
+-----------+           |   |     {                                               |   |         "id": 2,                                    |
|           |           |   |         "id": 1,                                    |   |         "artifactId": "felicitas.pojtinger.swabia.sol", |
| Laptop 1  +--------------->         "artifactId": "felicitas.pojtinger.swabia.sol", +--->         "ip": "192.168.178.102",                    |
|           |           |   |         "nodeId": "node1+239dj293+50"               |   |         "pingable": true                            |
+-----------+           |   |     }                                               |   |     },                                              |
                        |   | ]                                                   |   |     {                                               |
+-------------------+   |   |                                                     |   |         "id": 3,                                    |
|                   |   |   +-----------------------------------------------------+   |         "artifactId": "felicitas.pojtinger.swabia.sol", |
| Virtual Machine 1 +---+                                                             |         "ip": "192.168.178.121",                    |
|                   |   |                                                             |         "pingable": true                            |
+-------------------+   |                                                             |     }                                               |
                        |                                                             | ]                                                   |
+-------+               |                                                             |                                                     |
|       |               |                                                             +-----------------------------------------------------+
| (...) +---------------+
|       |
+-------+
```

### Services

- **Artifact Builders**: Create artifacts
  - [/ipxes](./packages/ipxe-manager/src/svc.js): UEFI & BIOS network bootloader compiler (queue)
  - [/grubs](./packages/grub-manager/src/svc.js): UEFI boot media bootloader compiler (queue)
  - [/syslinuxs](./packages/syslinux-manager/src/svc.js): BIOS boot media bootloader compiler (queue)
- **Artifact Configurators**: Edit the artifact behaviour without re-building the artifacts
  - [/mainscripts](./packages/mainscripts/src/svc.js): Registry for primary scripts that link to one or multiple subscripts
  - [/subscripts](./packages/subscripts/src/svc.js): Registry for secondary scripts that contain the actual boot logic
  - [/sshkey](./packages/sshkey-worker/src/svc.js): Generator for SSH public and private keys
  - [/sshkeys](./packages/sshkeys/src/svc.js): Registry for public SSH keys that will allow for passwordless access of nodes
  - [/kickstarts](./packages/kickstarts/src/svc.js): Registry for kickstart files that automate the OS installation
  - [/prebootscripts](./packages/prebootscripts/src/svc.js): Registry for files that run before the OS installation
  - [/postbootscripts](./packages/postbootscripts/src/svc.js): Registry for files that run after the OS installation
- **Artifact Distributors**: Put the artifacts on to the hosts
  - [/distributors](./packages/distributor-manager/src/svc.js): Distribute boot runtimes using the network (PXEBoot) (queue)
  - [/isos](./packages/iso-manager/src/svc.js): Distribute boot runtimes using boot media (USB/SD/CD/DVD) (queue)
- **Artifact Instance Managers**: Manage and register the nodes after installation
  - [/localnodes](./packages/localnode-manager/src/svc.js): Registry for installed nodes
- **Tooling**: Make development of the provisioner easier
  - [builder-utils](./packages/builder-utils/src/index.js): Common functionality for all artifact compilers
  - [insomnia](./packages/insomnia/src/workspace.json): The REST API as an Insomnia workspace

## Usage

Currently, the main way of interacting with a Cluster Platform Provisioner is the REST API. If you follow the instructions below you can use any IP of and node of your Kubernetes cluster as the API Gateway endpoint; we will use `services.provisioner.sandbox.cloud.alphahorizon.io` as a placeholder for curl here. If you prefer a full-blown REST client, take a look at the [Insomnia workspace](./packages/insomnia/src/workspace.json) and import it into [Insomnia](https://insomnia.rest/).
A much more simple to use frontend is currently being built and can be found in [it's package](./packages/frontend/README.md).

Another way of interacting with a Cluster Platform Provisioner is by using the [Moleculer](https://moleculer.services) services directly. You can use `npm install @clusterplatform/${SERVICE_PACKAGE_NAME}` and then import them as mixins to do so.

## Tutorial

### Services Deployment

> - **"Provisioner"** refers to all services working together to form the microplatform.
> - **"Operator"** refers to the person using the provisioner.
> - **"Host"** refers to physical or virtual hardware (i.e. a server, virtual machine, laptop) with a 64-bit X86 processor. ARM support is planned for the future.
> - **"Prestart Runtime"** refers to an environment that runs on a host before it starts. Here, such an environment start the installation and configuration of the precloud runtime.

```bash
# Run provisioner production version on Kubernetes (skaffold.yaml is at the repo root)
cd ../../
skaffold run -p provisioner--prod
```

For the production version, it is assumed that the following DNS and Networking configurations have been set up:

```plaintext
# Kubernetes Ingress
*.api.provisioner.sandbox.cloud.alphahorizon.io => LoadBalancer
# NodePort Services
services.provisioner.sandbox.cloud.alphahorizon.io => Any one of the nodes
```

Alternatively, this enables hot-reloading the files, automatic service restarts, inter-service code dependencies with a NPM caching repository and allocates more ressources to speed up development. Just replace `api.provisioner.sandbox.cloud.alphahorizon.io` with any of the node's IP and the NodePort of the gateway's service (`30002`) below.

```bash
# Run provisioner development version on Kubernetes (skaffold.yaml is at the repo root)
cd ../../
skaffold dev -p provisioner--dev
```

### Prestart Runtime Preparation

> - **"Prestart Runtime Distribution"** refers to the process of getting a system to run a prestart runtime.
> - **"Network Distributable"** refers to a prestart runtime that can be distributed by a type of prestart runtime distribution that works by using the network and thus eliminates the need for boot media.
> - **"Distributor"** refers to a system that serves as an "exit node" for the rest of the provisioner to the network in which the hosts onto which the network distributable should be deployed. It also allows for execution of additional scripts over after the precloud runtime has been installed if they are not reachable from the provisioner/the operator, such as nodes in remote locations.

```bash
# Run distributor production version on Docker
docker run \
    -e 'TRANSPORTER=nats://services.provisioner.sandbox.cloud.alphahorizon.io:30001' \
    -e 'CLUSTERPLATFORM_DISTRIBUTOR_ARTIFACTID=felicitas.pojtinger.swabia.sol' \
    --cap-add=NET_ADMIN \
    --net=host \
    -d \
    'registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker.prod:db4209a-dirty'
```

Alternatively, this does enable inter-service code dependencies with a NPM caching repository:

```bash

# Run distributor development version on Docker
docker run \
    -e 'TRANSPORTER=nats://services.provisioner.sandbox.cloud.alphahorizon.io:30001' \
    -e 'NPM_USER=verdaccio-user' \
    -e 'NPM_PASS=verdaccio-password' \
    -e 'NPM_EMAIL=verdaccio-user@example.com' \
    -e 'NPM_REGISTRY=http://services.provisioner.sandbox.cloud.alphahorizon.io:30004' \
    -e 'CLUSTERPLATFORM_DISTRIBUTOR_ARTIFACTID=felicitas.pojtinger.swabia.sol' \
    --cap-add=NET_ADMIN \
    --net=host \
    'registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker.dev:fa1f547-dirty'
```

### Prestart Runtime Preparation

#### Create Network Distributable

> - **"Artifact"** refers to an object managed by the provisioner such as distributors or network distributables.
> - **"artifactId"** refers to a unique identitifier that is used to tag artifacts.
> - **"BIOS"** refers to Basic Input/Output System, an old way of initializing hardware during the boot process. In the case of the distributor, this or UEFI is used to select the network or media distributable.
> - **"UEFI"** refers to the Unified Extensible Firmware Interface, the successor to the old BIOS. This is what all nearly all new hosts (except for virtual machines) use.
> - **"Network Bootloader"** refers to iPXE, a free/libre and open source system that, in the case of the provisioner, enables a host to run network bootloader scripts (iPXE scripts) such as mainscripts.

```bash
# Create UEFI iPXE network bootloader for distributor
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts/1",
    "platform": "bin-x86_64-efi",
    "driver": "ipxe",
    "extension": "efi"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
```

```bash
# Create BIOS iPXE network bootloader for distributor
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts/1",
    "platform": "bin-x86_64-pcbios",
    "driver": "ipxe",
    "extension": "kpxe"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
```

#### Create Media Distributable

> - **"Media Bootloader"** refers to either GRUB (for UEFI) or SYSLINUX (for BIOS), two free/libre and open source systems that enable a host to run media bootloader scripts (GRUB/SYSLINUX scripts) to, in the case of the provisioner, boot network bootloaders.

```bash
# Create UEFI iPXE network bootloader for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts/1",
    "platform": "bin-x86_64-efi",
    "driver": "ipxe",
    "extension": "efi"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
```

```bash
# Create BIOS iPXE network bootloader for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts/1",
    "platform": "bin",
    "driver": "ipxe",
    "extension": "lkrn"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
```

```bash
# Create GRUB media bootloader IMG for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "platform": "x86_64-efi",
    "architecture": "x64",
    "extension": "efi",
    "fragment": "img"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/grubs'
```

```bash
# Create GRUB media bootloader UEFI x64 for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "platform": "x86_64-efi",
    "architecture": "x64",
    "extension": "efi",
    "fragment": "efi"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/grubs'
```

```bash
# Create GRUB media bootloader UEFI x86 for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "platform": "x86_64-efi",
    "architecture": "x86",
    "extension": "efi",
    "fragment": "efi"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/grubs'
```

```bash
# Create SYSLINUX media bootloader Ldlinux for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "ldlinux.c32"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/syslinuxs'
```

```bash
# Create SYSLINUX media bootloader IsolinuxBin for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "isolinux.bin"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/syslinuxs'
```

```bash
# Create SYSLINUX media bootloader IsohdpfxBin for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "isohdpfx.bin"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/syslinuxs'
```

### Prestart Runtime Configuration

> - **"Prestart Runtime Configuration"** refers to the process of creating and/or deploying network bootloader scripts.
> - **"Embedded Script"** refers to a network bootloader script that is embedded into the network bootloader itself. Such a script is mostly used for chaining (loading) a mainscript and not intended to be changed all that often.
> - **"Mainscript"** refers to the primary network bootloader script that is being chained by the embedded script. It is commonly used to provide a boot menu to enable the selection of multiple subscripts.

```bash
# Create Mainscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!ipxe\nmenu Choose Script\nitem mainsubscriptserver_fedora29 Main Sub Script Server Fedora 29\nchoose --default mainsubscriptserver_fedora29 --timeout 3000 server && goto ${server}\n:mainsubscriptserver_fedora29\nchain http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/subscripts/1"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts'
```

> - **"Subscript"** refers to a secondary (or nearly infinitly nested) network bootloader script that is commonly being chained by a mainscript.

```bash
# Create Subscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!ipxe\nmenu Choose Script\nitem subscript Fedora 29\nchoose --default subscript --timeout 3000 subscript && goto ${subscript}\n:subscript\nset base http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\nkernel ${base}/images/pxeboot/vmlinuz initrd=initrd.img inst.repo=${base} inst.ks=http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/kickstarts/1\ninitrd ${base}/images/pxeboot/initrd.img\nboot"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/subscripts'
```

> - **"SSH Keys"** refers to keys for public/private key encryption.

```bash
# Get new SSH key pair
curl -G \
    --data-urlencode 'algorithm=ecdsa' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sshkey'
```

> - **"Public Key"** refers to a public SSH key. You may share this key to enable you to access a SSH-enabled node such as a localnode or globalnode.

```bash
# Add public SSH key
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB69xaEXw3y8PZeV6mjkTfK8X3z/0GlWe5dzuWcccD8fVHFl6W+XZ6qN+a8h0RD6OcFbk1mYTyh8sV2KbyIFNBk= pojntfx@pojntfx-x230-fedora\n",
    "artifactId": "felicitas.pojtinger.swabia.sol",
    "private": false
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sshkeys'
```

> - **"Private Key"** refers to a private SSH key. Do **not** share this key. Do **not** forget the newline at the end of the key or authentication will fail.

```bash
# Add private SSH key
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAaAAAABNlY2RzYS\n1zaGEyLW5pc3RwMjU2AAAACG5pc3RwMjU2AAAAQQQevcWhF8N8vD2Xlepo5E3yvF98/9Bp\nVnuXc7lnHHA/H1RxZelvl2eqjfmvIdEQ+jnBW5NZmE8ofLFdim8iBTQZAAAAuPZWcbr2Vn\nG6AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB69xaEXw3y8PZeV\n6mjkTfK8X3z/0GlWe5dzuWcccD8fVHFl6W+XZ6qN+a8h0RD6OcFbk1mYTyh8sV2KbyIFNB\nkAAAAhAOUvaCmEoMgsNL6Hl2XliKnMSvVOhXYyQqjGds21VWkKAAAAG3Bvam50ZnhAcG9q\nbnRmeC14MjMwLWZlZG9yYQECAwQ\n-----END OPENSSH PRIVATE KEY-----\n",
    "artifactId": "felicitas.pojtinger.swabia.sol",
    "private": true
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sshkeys'
```

> - **"Kickstart"** refers to a script that is used to automate the precloud runtime installation. It also commonly links to a prebootscript and a postbootscript.

```bash
# Create Kickstart
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#platform=x86, AMD64, or Intel EM64T\n#version=DEVEL\n# Keyboard layouts\nkeyboard us\n# Root password\nrootpw --plaintext asdfasdf123$$44\nsshkey --username=root \"ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB69xaEXw3y8PZeV6mjkTfK8X3z/0GlWe5dzuWcccD8fVHFl6W+XZ6qN+a8h0RD6OcFbk1mYTyh8sV2KbyIFNBk= pojntfx@pojntfx-x230-fedora\"\n# System language\nlang en_US\n# Reboot after installation\nreboot\n# System timezone\ntimezone Europe/Berlin\n# Use text mode install\ntext\n# Network information\nnetwork  --bootproto=dhcp --device=enp0s25\n# Use network installation\nurl --url=\"http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\"\n# System authorization information\nauth  --useshadow  --passalgo=sha512\n# Firewall configuration\nfirewall --disabled\n# SELinux configuration\nselinux --enforcing\n# Do not configure the X Window System\nskipx\n\n# System bootloader configuration\nbootloader --location=mbr\n# Clear the Master Boot Record\nzerombr\n# Partition clearing information\nclearpart --all\n# Disk partitioning information\npart /boot --asprimary --fstype=\"ext4\" --size=512\npart / --asprimary --fstype=\"ext4\" --grow --size=1\n\n%pre\ncurl http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/prebootscripts/1 | bash\n%end\n\n%post\ncurl http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/postbootscripts/1 > /usr/local/bin/postboot.sh\nchmod 744 /usr/local/bin/postboot.sh\ncat << EOF > /etc/systemd/system/postboot.service\n[Unit]\nDescription=Run once\nRequires=network-online.target\nAfter=network-online.target\n[Service]\nExecStart=/usr/local/bin/postboot.sh\n[Install]\nWantedBy=multi-user.target\nEOF\nchmod 664 /etc/systemd/system/postboot.service\nsystemctl enable postboot\n%end\n\n%packages\n@standard\n\n%end            \n"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/kickstarts'
```

> - **"Prebootscript"** refers to a script, commonly a shell script, that is run before the precloud runtime installer starts

```bash
# Create Prebootscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!/bin/bash\necho \"This could be the preboot script!\"\n"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/prebootscripts'
```

> - **"Postbootscript"** refers to a script, commonly a shell script, that is run after the precloud runtime installer finished

```bash
# Create Postbootscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!/bin/bash\nsudo dnf install openssh-server -y\nmkdir -p ~/.ssh\nsystemctl enable sshd\nip=$(echo $(ip -4 addr show | grep -Eo \"inet (addr:)?([0-9]*.){3}[0-9]*\" | grep -Eo \"([0-9]*.){3}[0-9]*\" | grep -v \"127.0.0.1\") | cut -d \" \" -f 1)\ncurl --request POST \"http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/localnodes?ip=${ip}&artifactId=felicitas.pojtinger.swabia.sol&pingable=true\"\n"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/postbootscripts'
```

### Prestart Runtime Distribution

#### Distribute Network Distributable

> - **"Queue"** refers to a system that consists of managers that schedule jobs to executed by workers. In the case of the provisioner, it is used to build artifacts in the background or, more generally, to do operations that can take a long time. For such artifacts you should check whether they are actually done (have a `progress` of `100`) before continuing.

```bash
# Get Mainscript
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts/1'
# Get Subscript
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/subscripts/1'
```

```bash
# Get public SSH key
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sshkeys/1'
# Get private SSH key
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sshkeys/2'
```

```bash
# Get Kickstart
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/kickstarts/1'
```

```bash
# Get Prebootscript
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/prebootscripts/1'
# Get Postbootscripts
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/postbootscripts/1'
```

```bash
# Get UEFI iPXE status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
# Get BIOS iPXE status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
```

```bash
# Get distributors
curl -G \
    --data-urlencode 'search=felicitas.pojtinger.swabia.sol' \
    --data-urlencode 'searchFields=artifactId' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/distributors'
```

> - **"Update Distributor"** refers to the process of distributing the network bootloaders to the distributors by scheduling a job on a distributor to download them.

```bash
# Update UEFI and BIOS iPXEs on distributor
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "ipxePxeUefiUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/ipxes/bffaf7bb-b52f-4b19-99ba-d7d4fa25b28b/ipxe.efi",
    "ipxePxeBiosUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/ipxes/cf6de9eb-2079-4708-98fc-6264f2a9c9af/ipxe.kpxe",
    "artifactId": 1,
    "device": "enp0s25",
    "range": "192.168.178.1"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/distributors/1'
```

> - **"Update Distributor Status"** refers to the process of starting/stopping distributor-internal services that enable the distribution of network distributables.

```bash
# Update distributor status to off
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "on": false,
    "artifactId": 1
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/distributors/1/status'
```

```bash
# Update distributor status to on
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "on": true,
    "artifactId": 1
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/distributors/1/status'
```

#### Distribute Media Distributable

> - **"Media Distributable"** refers to a prestart runtime that can be distributed by a type of prestart runtime distribution that uses boot media, such as USB sticks or DVDs.

```bash
# Get UEFI iPXE status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes/3'
# Get BIOS iPXE status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes/4'
```

```bash
# Get GRUB IMG status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/grubs/1'
# Get GRUB UEFI x64 status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/grubs/2'
# Get GRUB UEFI x86 status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/grubs/3'
```

```bash
# Get SYSLINUX Ldlinux status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/syslinuxs/1'
# Get SYSLINUX IsolinuxBin status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/syslinuxs/2'
# Get SYSLINUX IsohdpfxBin status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/syslinuxs/3'
```

```bash
# Create ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "ipxeUefiUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/ipxes/1353f0e4-09b9-48b1-a4fb-f45532730c65/ipxe.efi",
    "ipxeBiosUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/ipxes/eff537ee-bf99-48ea-be96-ed9ee08d62b9/ipxe.lkrn",
    "grubImgUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/grubs/c23bee3a-ee2d-4f44-8223-86bed61b7940/grub.img",
    "grubEfiX64Url": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/grubs/e8f68f77-5cb5-4a0a-8d47-fb31a73ea3bc/grub.zip",
    "grubEfiX86Url": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/grubs/da39b0b5-d15c-41e8-ab8a-4cf710cf427d/grub.zip",
    "ldLinuxUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/syslinuxs/83b15488-0ed5-4ee3-8352-5e3cecc87423/ldlinux.c32",
    "isolinuxBinUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/syslinuxs/b9771721-53bf-4dcb-a094-1a901a9203b9/isolinux.bin",
    "isohdpfxBinUrl": "http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/syslinuxs/dc68e8f5-900c-49ff-a376-e84b7c806056/isohdpfx.bin"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/isos'
```

```bash
# Get ISO status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/isos/1'
```

```bash
# Get ISO
curl -o 'dist.iso' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30003/isos/b1cf7b64-8965-4be0-9b6c-50d3c62d63fd/dist.iso'
```

### Precloud Runtime Distribution

> - **"Precloud Runtime"** refers to an environment that runs on a node after the prestart runtime has configured and installed the bare operating system (such as Fedora).
> - **"Node"** refers to a host that is running a precloud runtime or anything higher up the stack.
> - **"Undercloud Runtime"** refers to an environment that runs on a node after cloud services that run on top of the precloud runtime have been installed (such as Fedora with `containerd`).

#### Distribute Precloud Runtime with Network Distributable

Plug a host into the network to which the distributor from above is connected, set it to `Network Boot` (PXEBoot) and turn it on. Note that the network will have to have a router for DHCP as the distributor works in proxy mode to prevent conflicts. If you are using virtual machines, use a bridged network and at least 1500 MB of RAM to fit the entire ramdisk. Full installation of the precloud runtime on the host and the registration of the node afterwards will take about 30 Minutes, depending on the speed of the host's internet connection.

#### Distribute Precloud Runtime with Media Distributable

Flash the ISO from above to a USB and boot from it. If you are using virtual machines, use at least 1500 MB of RAM to fit the entire ramdisk. Full installation of the precloud runtime on the host and the registration of the node afterwards will take about 30 Minutes, depending on the speed of the host's internet connection.

### Get Localnodes

> - **"Localnode"** refers to a node that is reachable from other localnodes in the same network as a distributor, but not necessarly from the operator.

```bash
# Get Localnodes
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/localnodes'
```

```bash
# Get Localnode
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/localnodes/1'
```

### Create Globalnodes from Localnodes

> - **"Postinstallscript"** refers to a script (commonly a shell script) that can be run on a localnode from a distributor using SSH, which makes it possible to execute scripts on localnodes that are not reachable by the operator but reachable from a distributor. Such scripts are commonly used to run the commands necessary to join a localnode to a VPN.
> - **"VPN"** refers to a virtual private network, a virtual network that allows globalnodes and/or the operator to connect to each other as though they were connected to the same ethernet switch.
> - **"Globalnode"** refers to a node that is reachable from any other globalnode connected to the same VPN.
> - **"Undercloud"** refers to one or multiple undercloud runtimes providing an abstract system atop the precloud runtime (such as Kubernetes and KubeVirt).
> - **"Overcloud Runtime"** refers to an environment that runs on top of an undercloud (such as Fedora).
> - **"Overcloud"** refers to one or multiple overcloud runtimes providing an abstract system atop the undercloud runtime (such as Kubernetes)

It is possible to execute an arbitrary command as root on a localnode using the distributors and SSH. Here, we are going to use this to create a Globalnode, but the possibilities are endless. First, create a VPN using free/libre and open source [ZeroTier](https://zerotier.com). Then, copy it's network ID below to join the node into the network. Note that this uses the node's artifactId and assumes a working distributor with the node's artifactId is in the node's network.

```bash
# Create Globalnode from Localnode
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "script": "curl https://install.zerotier.com/ | sudo bash\nzerotier-cli join 1c33c1ced0d02ef9\nip a | grep zt",
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/localnodes/1/script'
```

### Get Globalnodes

Open [https://my.zerotier.com/network/1c33c1ced0d02ef9](https://my.zerotier.com/network/1c33c1ced0d02ef9) in your browser; the globalnodes should appear there after some time. Click the checkbox in the `Auth?` column and the node will be given an IP address; see the `Managed IPs` column. You can the join other localnodes the operator's machine into the VPN using the command you've used above which turns them into globalnodes and enables them to communicate with each other.

## More

See [Home](../site/src/index.md).
