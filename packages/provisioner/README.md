# Cluster Platform Provisioner

![Cluster Platform Provisioner logo](./assets/logo.webp)

Hosts as a service.

## Features

> TODO: Add Features

## Usage

### Preboot Runtime Preparation

#### Option 1: Create Network Distributable

```bash
# Deploy services (skaffold.yaml is at the repo root)
cd ../../
skaffold dev -p provisioner--dev
```

```bash
# Deploy distributor
docker run \
    -e 'TRANSPORTER=nats://134.209.52.222:30002' \
    -e 'NPM_USER=verdaccio-user' \
    -e 'NPM_PASS=verdaccio-password' \
    -e 'NPM_EMAIL=verdaccio-user@example.com' \
    -e 'NPM_REGISTRY=http://134.209.52.222:30004' \
    -e 'CLUSTERPLATFORM_DISTRIBUTOR_ARTIFACTID=felix.pojtinger.swabia.sol' \
    --cap-add=NET_ADMIN \
    --net=host \
    'registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:03d8d86-dirty'
```

```bash
# Create UEFI iPXE for distributor
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://134.209.52.222:30300/api/mainscripts/1",
    "platform": "bin-x86_64-efi",
    "driver": "ipxe",
    "extension": "efi"
}' \
    'http://134.209.52.222:30300/api/ipxes'
```

```bash
# Create BIOS iPXE for distributor
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://134.209.52.222:30300/api/mainscripts/1",
    "platform": "bin-x86_64-pcbios",
    "driver": "ipxe",
    "extension": "kpxe"
}' \
    'http://134.209.52.222:30300/api/ipxes'
```

#### Option 2: Create Media Distributable

```bash
# Deploy services (skaffold.yaml is at the repo root)
cd ../../
skaffold dev -p provisioner--dev
```

```bash
# Create UEFI iPXE for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://134.209.52.222:30300/api/mainscripts/1",
    "platform": "bin-x86_64-efi",
    "driver": "ipxe",
    "extension": "efi"
}' \
    'http://134.209.52.222:30300/api/ipxes'
```

```bash
# Create BIOS iPXE for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://134.209.52.222:30300/api/mainscripts/1",
    "platform": "bin",
    "driver": "ipxe",
    "extension": "lkrn"
}' \
    'http://134.209.52.222:30300/api/ipxes'
```

```bash
# Create GRUB IMG for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "platform": "x86_64-efi",
    "architecture": "x64",
    "extension": "efi",
    "fragment": "img"
}' \
    'http://134.209.52.222:30300/api/grubs'
```

```bash
# Create GRUB UEFI x64 for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "platform": "x86_64-efi",
    "architecture": "x64",
    "extension": "efi",
    "fragment": "efi"
}' \
    'http://134.209.52.222:30300/api/grubs'
```

```bash
# Create GRUB UEFI x86 for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "platform": "x86_64-efi",
    "architecture": "x86",
    "extension": "efi",
    "fragment": "efi"
}' \
    'http://134.209.52.222:30300/api/grubs'
```

```bash
# Create SYSLINUX Ldlinux for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "ldlinux.c32"
}' \
    'http://134.209.52.222:30300/api/syslinuxs'
```

```bash
# Create SYSLINUX IsolinuxBin for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "isolinux.bin"
}' \
    'http://134.209.52.222:30300/api/syslinuxs'
```

```bash
# Create SYSLINUX IsohdpfxBin for ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "isohdpfx.bin"
}' \
    'http://134.209.52.222:30300/api/syslinuxs'
```

```bash
# Get UEFI iPXE status
curl 'http://134.209.52.222:30300/api/ipxes/3'
# Get BIOS iPXE status
curl 'http://134.209.52.222:30300/api/ipxes/4'
```

```bash
# Get GRUB IMG status
curl 'http://134.209.52.222:30300/api/grubs/1'
# Get GRUB UEFI x64 status
curl 'http://134.209.52.222:30300/api/grubs/2'
# Get GRUB UEFI x86 status
curl 'http://134.209.52.222:30300/api/grubs/3'
```

```bash
# Get SYSLINUX Ldlinux status
curl 'http://134.209.52.222:30300/api/syslinuxs/1'
# Get SYSLINUX IsolinuxBin status
curl 'http://134.209.52.222:30300/api/syslinuxs/2'
# Get SYSLINUX IsohdpfxBin status
curl 'http://134.209.52.222:30300/api/syslinuxs/3'
```

```bash
# Create ISO
curl -H 'Content-Type: application/json' \
    -d '{
    "label": "Cluster Platform Provisioner ISO",
    "ipxeUefiUrl": "http://134.209.52.222:30900/ipxes/1353f0e4-09b9-48b1-a4fb-f45532730c65/ipxe.efi",
    "ipxeBiosUrl": "http://134.209.52.222:30900/ipxes/eff537ee-bf99-48ea-be96-ed9ee08d62b9/ipxe.lkrn",
    "grubImgUrl": "http://134.209.52.222:30900/grubs/c23bee3a-ee2d-4f44-8223-86bed61b7940/grub.img",
    "grubEfiX64Url": "http://134.209.52.222:30900/grubs/e8f68f77-5cb5-4a0a-8d47-fb31a73ea3bc/grub.zip",
    "grubEfiX86Url": "http://134.209.52.222:30900/grubs/da39b0b5-d15c-41e8-ab8a-4cf710cf427d/grub.zip",
    "ldLinuxUrl": "http://134.209.52.222:30900/syslinuxs/83b15488-0ed5-4ee3-8352-5e3cecc87423/ldlinux.c32",
    "isolinuxBinUrl": "http://134.209.52.222:30900/syslinuxs/b9771721-53bf-4dcb-a094-1a901a9203b9/isolinux.bin",
    "isohdpfxBinUrl": "http://134.209.52.222:30900/syslinuxs/dc68e8f5-900c-49ff-a376-e84b7c806056/isohdpfx.bin"
}' \
    'http://134.209.52.222:30300/api/isos'
```

### Preboot Runtime Configuration

```bash
# Create Mainscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!ipxe\nmenu Choose Script\nitem mainsubscriptserver_fedora29 Main Sub Script Server Fedora 29\nchoose --default mainsubscriptserver_fedora29 --timeout 3000 server && goto ${server}\n:mainsubscriptserver_fedora29\nchain http://134.209.52.222:30300/api/subscripts/1"
}' \
    'http://134.209.52.222:30300/api/mainscripts'
```

```bash
# Create Subscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!ipxe\nmenu Choose Script\nitem subscript Fedora 29\nchoose --default subscript --timeout 3000 subscript && goto ${subscript}\n:subscript\nset base http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\nkernel ${base}/images/pxeboot/vmlinuz initrd=initrd.img inst.repo=${base} inst.ks=http://134.209.52.222:30300/api/kickstarts/1\ninitrd ${base}/images/pxeboot/initrd.img\nboot"
}' \
    'http://134.209.52.222:30300/api/subscripts'
```

```bash
# Create SSH key pair
ssh-keygen -t ecdsa -N '' -f ~/.ssh/provisioner_id
```

```bash
# Add public SSH key
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB69xaEXw3y8PZeV6mjkTfK8X3z/0GlWe5dzuWcccD8fVHFl6W+XZ6qN+a8h0RD6OcFbk1mYTyh8sV2KbyIFNBk= pojntfx@pojntfx-x230-fedora\n",
    "artifactId": "felix.pojtinger.swabia.sol",
    "private": false
}' \
    'http://134.209.52.222:30300/api/sshkeys'
```

```bash
# Add private SSH key
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAaAAAABNlY2RzYS\n1zaGEyLW5pc3RwMjU2AAAACG5pc3RwMjU2AAAAQQQevcWhF8N8vD2Xlepo5E3yvF98/9Bp\nVnuXc7lnHHA/H1RxZelvl2eqjfmvIdEQ+jnBW5NZmE8ofLFdim8iBTQZAAAAuPZWcbr2Vn\nG6AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB69xaEXw3y8PZeV\n6mjkTfK8X3z/0GlWe5dzuWcccD8fVHFl6W+XZ6qN+a8h0RD6OcFbk1mYTyh8sV2KbyIFNB\nkAAAAhAOUvaCmEoMgsNL6Hl2XliKnMSvVOhXYyQqjGds21VWkKAAAAG3Bvam50ZnhAcG9q\nbnRmeC14MjMwLWZlZG9yYQECAwQ\n-----END OPENSSH PRIVATE KEY-----\n",
    "artifactId": "felix.pojtinger.swabia.sol",
    "private": true
}' \
    'http://134.209.52.222:30300/api/sshkeys'
```

```bash
# Create Kickstart
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#platform=x86, AMD64, or Intel EM64T\n#version=DEVEL\n# Keyboard layouts\nkeyboard us\n# Root password\nrootpw --plaintext asdfasdf123$$44\nsshkey --username=root \"ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB69xaEXw3y8PZeV6mjkTfK8X3z/0GlWe5dzuWcccD8fVHFl6W+XZ6qN+a8h0RD6OcFbk1mYTyh8sV2KbyIFNBk= pojntfx@pojntfx-x230-fedora\"\n# System language\nlang en_US\n# Reboot after installation\nreboot\n# System timezone\ntimezone Europe/Berlin\n# Use text mode install\ntext\n# Network information\nnetwork  --bootproto=dhcp --device=enp0s25\n# Use network installation\nurl --url=\"http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\"\n# System authorization information\nauth  --useshadow  --passalgo=sha512\n# Firewall configuration\nfirewall --disabled\n# SELinux configuration\nselinux --enforcing\n# Do not configure the X Window System\nskipx\n\n# System bootloader configuration\nbootloader --location=mbr\n# Clear the Master Boot Record\nzerombr\n# Partition clearing information\nclearpart --all\n# Disk partitioning information\npart /boot --asprimary --fstype=\"ext4\" --size=512\npart / --asprimary --fstype=\"ext4\" --grow --size=1\n\n%pre\ncurl http://134.209.52.222:30300/api/prebootscripts/1 | bash\n%end\n\n%post\ncurl http://134.209.52.222:30300/api/postbootscripts/1 > /usr/local/bin/postboot.sh\nchmod 744 /usr/local/bin/postboot.sh\ncat << EOF > /etc/systemd/system/postboot.service\n[Unit]\nDescription=Run once\nRequires=network-online.target\nAfter=network-online.target\n[Service]\nExecStart=/usr/local/bin/postboot.sh\n[Install]\nWantedBy=multi-user.target\nEOF\nchmod 664 /etc/systemd/system/postboot.service\nsystemctl enable postboot\n%end\n\n%packages\n@standard\n\n%end            \n"
}' \
    'http://134.209.52.222:30300/api/kickstarts'
```

```bash
# Create Prebootscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!/bin/bash\necho \"This could be the preboot script!\"\n"
}' \
    'http://134.209.52.222:30300/api/prebootscripts'
```

```bash
# Create Postbootscript
curl -H 'Content-Type: application/json' \
    -d '{
    "text": "#!/bin/bash\nsudo dnf install openssh-server -y\nmkdir -p ~/.ssh\nsystemctl enable sshd\nip=$(echo $(ip -4 addr show | grep -Eo \"inet (addr:)?([0-9]*.){3}[0-9]*\" | grep -Eo \"([0-9]*.){3}[0-9]*\" | grep -v \"127.0.0.1\") | cut -d \" \" -f 1)\ncurl --request POST \"http://134.209.52.222:30300/api/localnodes?ip=${ip}&artifactId=felix.pojtinger.swabia.sol&pingable=true\"\n"
}' \
    'http://134.209.52.222:30300/api/postbootscripts'

```

```bash
# Get Mainscript
curl 'http://134.209.52.222:30300/api/mainscripts/1'
# Get Subscript
curl 'http://134.209.52.222:30300/api/subscripts/1'
```

```bash
# Get public SSH key
curl 'http://134.209.52.222:30300/api/sshkeys/1'
# Get private SSH key
curl 'http://134.209.52.222:30300/api/sshkeys/2'
```

```bash
# Get Kickstart
curl 'http://134.209.52.222:30300/api/kickstarts/1'
```

```bash
# Get Prebootscript
curl 'http://134.209.52.222:30300/api/prebootscripts/1'
# Get Postbootscripts
curl 'http://134.209.52.222:30300/api/postbootscripts/1'
```

### Preboot Runtime Distribution

#### Option 1: Distribute Network Distributable

```bash
# Get UEFI iPXE status
curl 'http://134.209.52.222:30300/api/ipxes'
# Get BIOS iPXE status
curl 'http://134.209.52.222:30300/api/ipxes'
```

```bash
# Get distributors
curl -G \
    --data-urlencode 'search=felix.pojtinger.swabia.sol' \
    --data-urlencode 'searchFields=artifactId' \
    'http://134.209.52.222:30300/api/distributors'
```

```bash
# Update UEFI and BIOS iPXEs on distributor
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "ipxePxeUefiUrl": "http://134.209.52.222:30900/ipxes/bffaf7bb-b52f-4b19-99ba-d7d4fa25b28b/ipxe.efi",
    "ipxePxeBiosUrl": "http://134.209.52.222:30900/ipxes/cf6de9eb-2079-4708-98fc-6264f2a9c9af/ipxe.kpxe",
    "artifactId": 1,
    "device": "enp0s25",
    "range": "192.168.178.1"
}' \
    'http://134.209.52.222:30300/api/distributors/1'
```

```bash
# Update distributor status to off
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "on": false,
    "artifactId": 1
}' \
    'http://134.209.52.222:30300/api/distributors/1/status'
```

```bash
# Update distributor status to on
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "on": true,
    "artifactId": 1
}' \
    'http://134.209.52.222:30300/api/distributors/1/status'
```

#### Option 2: Distribute Media Distributable

```bash
# Get ISO status
curl 'http://134.209.52.222:30300/api/isos/1'
```

```bash
# Get ISO
curl -o 'dist.iso' \
    'http://134.209.52.222:30900/isos/b1cf7b64-8965-4be0-9b6c-50d3c62d63fd/dist.iso'
```

### Precloud Runtime Distribution

> "Precloud Runtime" refers to the bare operating system (i.e. Fedora) before the distribution of cloud software (i.e. Kubernetes + KubeVirt") turns it into a "Undercloud Runtime".
> "Host" refers to the physical/virtual machine running either nothing or a Preboot Runtime, "Node" to the physical/virtual machine running a Precloud Runtime; more precisely, the official naming scheme calls nodes running Precloud Runtimes without a VPN connection (they are not yet reachable from outside the network in which the distributor resides) "Localnodes".

#### Option 1: Distribute Precloud Runtime with the Network Distributable

Plug a host into the network to which the distributor from above is connected, set it to `Network Boot` (PXEBoot) and turn it on. Note that the network will have to have a router for DHCP as the distributor works in proxy mode to prevent conflicts. If you are using virtual machines, use a bridged network and at least 1500 MB of RAM to fit the entire ramdisk. Full installation of the precloud runtime on the host and the registration of the node afterwards will take about 30 Minutes, depending on the speed of the host's internet connection.

#### Option 2: Distribute Precloud Runtime with the Media Distributable

Flash the ISO from above to a USB and boot from it. If you are using virtual machines, use at least 1500 MB of RAM to fit the entire ramdisk. Full installation of the precloud runtime on the host and the registration of the node afterwards will take about 30 Minutes, depending on the speed of the host's internet connection.

### Get Localnodes

```bash
# Get Localnodes
curl 'http://134.209.52.222:30300/api/localnodes'
```

```bash
# Get Localnode
curl 'http://134.209.52.222:30300/api/localnodes/1'
```

### Create Globalnode from Localnode

> "Globalnode" refers to a "Localnode" that has been connected to a VPN and is thus reachable from outside the network in which the distributor resides.

It is possible to execute an arbitrary command as root on a localnode using the distributors and SSH. Here, we are going to use this to create a Globalnode, but the possibilities are endless. First, create a VPN using free/libre and open source [ZeroTier](https://zerotier.com). Then, copy it's network ID below to join the node into the network. Note that this uses the node's tag and assumes a working distributor with the node's tag is in the node's network.

```bash
# Create Globalnode from Localnode
curl -X PUT -H 'Content-Type: application/json' \
    -d '{
    "script": "curl https://install.zerotier.com/ | sudo bash\nzerotier-cli join 1c33c1ced0d02ef9\nip a | grep zt",
}' \
    'http://134.209.52.222:30300/api/localnodes/1/script'
```

### Get Globalnodes

Open [https://my.zerotier.com/network/1c33c1ced0d02ef9](https://my.zerotier.com/network/1c33c1ced0d02ef9) in your browser globalnode should appear there. Click the checkbox in the `Auth?` column and the node will be given an IP address; see the `Managed IPs` column. You can the join other Localnodes or your development machine into the VPN using the command you've used above which turns them into Globalnodes and enables the nodes to talk to each other.

## More

See [Home](../site/src/index.md).
