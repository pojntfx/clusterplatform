# Cluster Platform Provisioner Notes

## Tag View

```plaintext
+----------------------------------------------------+
|                                                    |
|  # felicitas.pojtinger.swabia.sol                      |
|                                                    |
|  Label:  Felicitas Pojtinger, Swabia, Sol Bootmedium   | (input)
|  Script: #!ipxe\nautoboot                          |
|                                                    |
|  globalnode1                        192.168.178.1  | (output)
|  globalnode3                        192.168.178.6  |
|  globalnode8                        192.168.178.8  |
|                                                    |
+----------------------------------------------------+
```

## GET Bootmedium (Not Tag View)

```json
{
  "id": 1,
  "tag": "felicitas.pojtinger.swabia.sol",
  "label": "Felicitas Pojtinger, Swabia, Sol Bootmedium",
  "script": "#!ipxe\nautoboot"
}
```

## GET Endpoints

```plaintext
GET /tags/1 (there is no "tag metaservice" that aggregates!)
GET /bootruntimes?tag=felicitas.pojtinger.swabia.sol
GET /distributors?tag=felicitas.pojtinger.swabia.sol
GET /grubs?tag=felicitas.pojtinger.swabia.sol
GET /ipxes?tag=felicitas.pojtinger.swabia.sol
GET /isos?tag=felicitas.pojtinger.swabia.sol
GET /kickstarts?tag=felicitas.pojtinger.swabia.sol
GET /localnodes?tag=felicitas.pojtinger.swabia.sol
GET /mainscripts?tag=felicitas.pojtinger.swabia.sol
GET /postbootscripts?tag=felicitas.pojtinger.swabia.sol
GET /prebootscripts?tag=felicitas.pojtinger.swabia.sol
GET /sshkeys?tag=felicitas.pojtinger.swabia.sol
GET /subscripts?tag=felicitas.pojtinger.swabia.sol
GET /syslinuxs?tag=felicitas.pojtinger.swabia.sol
GET /globalnodes?tag=felicitas.pojtinger.swabia.sol
GET /networks?tag=felicitas.pojtinger.swabia.sol
```

## POST Endpoints

```plaintext
POST /bootruntime?tag=felicitas.pojtinger.swabia.sol
POST /distributors?tag=felicitas.pojtinger.swabia.sol&bootruntime=felicitas.pojtinger.swabia.sol
POST /grubs?tag=felicitas.pojtinger.swabia.sol
POST /ipxes?tag=felicitas.pojtinger.swabia.sol&bootruntime=felicitas.pojtinger.swabia.sol
POST /isos?tag=felicitas.pojtinger.swabia.sol&bootruntime=felicitas.pojtinger.swabia.sol
POST /kickstarts?tag=felicitas.pojtinger.swabia.sol
POST /localnodes?tag=felicitas.pojtinger.swabia.sol
POST /mainscripts?tag=felicitas.pojtinger.swabia.sol
POST /postbootscripts?tag=felicitas.pojtinger.swabia.sol
POST /prebootscripts?tag=felicitas.pojtinger.swabia.sol
POST /sshkeys?tag=felicitas.pojtinger.swabia.sol
POST /subscripts?tag=felicitas.pojtinger.swabia.sol
POST /syslinuxs?tag=felicitas.pojtinger.swabia.sol
POST /globalnodes?tag=felicitas.pojtinger.swabia.sol&network=felicitas.pojtinger.swabia.sol&localnodes=felicitas.pojtinger.swabia.sol
POST /networks?tag=felicitas.pojtinger.swabia.sol
```

## Mixed Endpoints

```plaintext
POST /ipxes
ipxes.create(script, platform, driver, extension)
POST /grubs
grubs.create(platform, architecture, extension, label, fragment)
POST /syslinuxs
syslinuxs.create(fragment)
POST /isos
isos.create(label, ipxeUefiUrl, ipxeBiosUrl, grubImgUrl, grubEfiX64Url, grubEfiX86Url, ldLinuxUrl, isolinuxBinUrl, isohdpfxBinUrl)
POST /distributors
distributors.create(nodeId, artifactId)
PUT /distributors
distributors.update(ipxePxeUefiUrl, ipxePxeBiosUrl, artifactId, id, device, range)
PUT /distributors/:id/status
distributors.updateStatus(id, artifactId, on)
POST /mainscripts
mainscripts.create(text)
POST /subscripts
subscripts.create(text)
POST /kickstarts
kickstarts.create(text)
POST /prebootscripts
prebootscripts.create(text)
POST /postbootscripts
postbootscripts.create(text)
POST /sshkeys
sshkeys.create(text, artifactId, private)
POST /localnodes
localnodes.create(ip, artifactId, pingable)
PUT /localnodes/:id/vpn
localnodes.updateVpn(id, network)
```

## New Docs Structure

```plaintext
# Cluster Platform Provisioner
    ## Features
        ### Introduction
        ### Diagram
        ### Services
    ## Usage
        ### REST API
        ### Moleculer Services
        ### Frontend
    ## Deployment
        ### Prerequesites
            #### Kubernetes Cluster
            #### NodePort
            #### Optional Ingress and DNS
        ### Services
        ### Distributor
    ## Tutorial
        ### Input
            #### Mainscript
            #### Subscript
            #### SSH Keys
            #### Kickstart
            #### Prebootscript
            #### Postbootscript
        ### Provisioning
            #### With Network
                ##### Create Preboot Runtime for Network
                ##### Distribute Preboot Runtime with Network
                ##### Activate Distributor
                ##### Distribute Precloud Runtime with Network
            #### Provisioning with Media
                ##### Create Preboot Runtime for Media
                ##### Distribute Preboot Runtime with Media
                ##### Distribute Precloud Runtime with Media
        ### Output
            #### Localnodes
            #### Create Globalnodes from Localnodes
            #### Globalnodes
    ## Development
        ### Prerequesites
        ### Services
        ### Distributor
    ## More
```

## Aarch64 Services Concepts

Services prefixed with `rpi3` are specific to the Raspberry Pi 3, but you could of course implement such services for any platform you want to support; the other services have been implemented platform-independent.

```js
const ubootWorker = {
  create: {
    params: {
      platform: "string",
      target: "string",
      fragment: "string",
      script: "string"
    },
    handler: async function(ctx) {
      const uboot = new Uboot();
      await uboot.getSources("remote");
      if (ctx.params.fragment === "ubootCmdImg") {
        await uboot.configure(ctx.params.script); // ubootCmd
        await uboot.buildImage();
      } else {
        await uboot.build({
          platform: ctx.params.platform,
          target: ctx.params.target
        }); // ubootBin
      }
      await uboot.package(ctx.params.fragment);
      return await uboot.upload(ctx.params.fragment);
    }
  }
};

const rpi3firmwareWorker = {
  create: {
    params: {
      fragment: "string"
    },
    handler: async function(ctx) {
      const rpi3Patches = new Rpi3Patches();
      await rpi3Patches.getSources("remote");
      await rpi3Patches.package(ctx.params.fragment); // bootcodeBin, fixupDat, startElf
      return await rpi3Patches.upload();
    }
  }
};

const rpi3patchesWorker = {
  create: {
    params: {
      ixpeEfiUrl: "string",
      bootcodeBinUrl: "string",
      fixupDatUrl: "string",
      startElfUrl: "string",
      ubootBinUrl: "string",
      ubootCmdImgUrl: "string",
      script: "string"
    },
    handler: async function(ctx) {
      const rpi3Images = new Rpi3Images();
      await rpi3Images.download(ctx.params);
      await rpi3Images.configure(ctx.params.script); // config.txt
      await rpi3Images.build();
      await rpi3Images.package();
      return await rpi3Images.upload();
    }
  }
};

const sdimagesWorker = {
  create: {
    params: {
      label: "string",
      artifactsZipUrl: "string"
    },
    handler: async function(ctx) {
      const sdImages = new SdImages();
      await sdImages.download(ctx.params.artifactsZipUrl);
      await sdImages.build(ctx.params.label); // CLUSTERPLATFORM_BOOT_MEDIA
      await sdImages.package();
      return await sdImages.upload();
    }
  }
};
```

## Aarch64 Services Bash Implementation

```bash
# function env.get_dependencies() {
#     sudo dnf install uboot-tools gcc-aarch64-linux-gnu -y
# }

# function env.setup() {
#     export WORKSPACE=${PWD}
# }

# function uboot.get_sources() {
#     cd ${WORKSPACE}
#     git clone git://git.denx.de/u-boot.git
# }

# function uboot.configure() {
#     cd ${WORKSPACE}/u-boot
#     cat >boot.cmd <<EOF
# load mmc 0:1 0x0020000 snp.efi
# bootefi 0x0020000
# EOF
#     sudo mkimage -C none -A arm64 -T script -d ${WORKSPACE}/u-boot/boot.cmd /mnt/rpi3-sd/boot.scr
# }

# function uboot.make() {
#     cd ${WORKSPACE}/u-boot
#     make CROSS_COMPILE=aarch64-linux-gnu- rpi_3_defconfig
#     make CROSS_COMPILE=aarch64-linux-gnu- -j$(nproc) -s all
#     cd ${WORKSPACE}
# }

# the following is already in the `ipxe` services
# function ipxe.get_sources() {
#     cd ${WORKSPACE}
#     git clone https://github.com/ipxe/ipxe.git # to fix cross-compilation
# }

# function ipxe.start_container() {
#     docker run --rm -it -w /home/ipxe -v $PWD/ipxe:/home/ipxe:z \
#         3mdeb/edk2 /bin/bash
# }

# function ipxe.patch() {
#     touch ${WORKSPACE}/ipxe/src/config/local/nap.h
#     cat >${WORKSPACE}/ipxe/src/config/local/nap.h <<EOF
# /* nap.h */
# #undef NAP_EFIX86
# #undef NAP_EFIARM
# #define NAP_NULL
# EOF
# }
# function ipxe.make() {
#     # vi ipxe/src/Makefile.housekeeping # https://github.com/secumod/ipxe/commit/71a1a807c0da8e49c9f2a7d9797a746a0dab7588
#     cd ${WORKSPACE}/ipxe/src
#     make CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm64 bin-arm64-efi/snp.efi
#     cd ${WORKSPACE}
# }

# function rpi3firmware.get_sources() {
#     cd ${WORKSPACE}
#     git clone --depth 1 git://github.com/raspberrypi/firmware
# }

function rpi3firmware.configure() {
    cat >config.txt <<EOF
arm_64bit=1
device_tree_address=0x100
device_tree_end=0x8000
EOF
}

# function sd.mount() {
#     sudo mkdir -p /mnt/rpi3-sd
#     sudo mount /dev/sdd1 /mnt/rpi3-sd
# }

# function sd.configure() {
#     cd ${WORKSPACE}/u-boot
#     cat >boot.cmd <<EOF
# load mmc 0:1 0x0020000 snp.efi
# bootefi 0x0020000
# EOF
#     cat >config.txt <<EOF
# arm_64bit=1
# device_tree_address=0x100
# device_tree_end=0x8000
# EOF
#     cd ${WORKSPACE}
# }

# function sd.copy() {
#     sudo cp ${WORKSPACE}/firmware/boot/{bootcode.bin,fixup.dat,start.elf} /mnt/rpi3-sd
#     sudo cp ${WORKSPACE}/u-boot/u-boot.bin /mnt/rpi3-sd/kernel.img
#     sudo cp ${WORKSPACE}/u-boot/config.txt /mnt/rpi3-sd/config.txt
#     sudo cp ${WORKSPACE}/ipxe/src/bin-arm64-efi/snp.efi /mnt/rpi3-sd/snp.efi
#     sudo mkimage -C none -A arm64 -T script -d ${WORKSPACE}/u-boot/boot.cmd /mnt/rpi3-sd/boot.scr
# }

# function sd.unmount() {
#     sync
#     sudo umount /mnt/rpi3-sd
# }
```

## Aarch64 Uboot Worker Bash Implementation

```bash
# sudo dnf install uboot-tools gcc-aarch64-linux-gnu -y

function uboot.init() {
    local WORKDIR_ID=$1
    export WORKDIR="${PWD}/workspace-${1}"
    export SRCDIR="${WORKDIR}/srcdir"
    export BUILDDIR="${WORKDIR}/builddir"
    export DISTDIR="${WORKDIR}/distdir"
    export PACKAGEDIR="${WORKDIR}/packagedir"

    mkdir -p ${WORKDIR}
    mkdir -p ${SRCDIR}
    mkdir -p ${BUILDDIR}
    mkdir -p ${DISTDIR}
}

function uboot.getSources() {
    git clone --depth 1 git://git.denx.de/u-boot.git ${SRCDIR}
}

function uboot.buildUbootBin() {
    local PLATFORM=$1
    local TARGET=$2
    cp -r ${SRCDIR}/** ${BUILDDIR}
    cd ${BUILDDIR}
    make CROSS_COMPILE=${PLATFORM} ${TARGET}
    make CROSS_COMPILE=${PLATFORM} -j$(nproc) -s all
    cp -r ${BUILDDIR}/u-boot.bin ${DISTDIR}/kernel.img
}

function uboot.buildBootCmdImg() {
    local PLATFORM=$1
    local SCRIPT=$2
    cp -r ${SRCDIR} ${BUILDDIR}
    cd ${BUILDDIR}
    echo "${SCRIPT}" >${BUILDDIR}/boot.cmd
    mkimage -C none -A ${PLATFORM} -T script -d ${BUILDDIR}/boot.cmd ${DISTDIR}/boot.scr
}
```

## Raspberry Pi 3 Firmware Worker Bash Implementation

```bash
function rpi3firmware.init() {
    local WORKDIR_ID=$1
    export WORKDIR="${PWD}/workspace-${WORKDIR_ID}"
    export SRCDIR="${WORKDIR}/srcdir"
    export PACKAGEDIR="${WORKDIR}/packagedir"

    mkdir -p ${WORKDIR}
    mkdir -p ${SRCDIR}
    mkdir -p ${PACKAGEDIR}
}

function rpi3firmware.getSources() {
    git clone --depth 1 git://github.com/raspberrypi/firmware ${SRCDIR}
}

function rpi3firmware.package() {
    local FRAGMENT=$1
    cp ${SRCDIR}/boot/${FRAGMENT} ${PACKAGEDIR}/${FRAGMENT}
}
```

## Aarch64 Sdimages Worker Bash Implementation

```bash
# sudo dnf install fuse-devel libfdisk-devel -y

function sdimages.init() {
    local WORKDIR_ID=$1
    export WORKDIR="${PWD}/workspace-${WORKDIR_ID}"
    export DEPENDENCIES_PARTFSDIR=${WORKDIR}/partfs
    export INPUTDIRSRCDIR=/home/pojntfx/Developer/rpiimages/efi
    export INPUTDIR=${WORKDIR}/efi
    export SDIMGSDIR=${WORKDIR}/sdimgs
    export DISTDIR=${WORKDIR}/dist

    mkdir -p ${WORKDIR}
    mkdir -p ${DEPENDENCIES_PARTFSDIR}
    mkdir -p ${INPUTDIR}
    mkdir -p ${SDIMGSDIR}
    mkdir -p ${DISTDIR}
}

function sdimages.installDependencies() {
    cd ${DEPENDENCIES_PARTFSDIR}
    git clone https://github.com/braincorp/partfs.git ${DEPENDENCIES_PARTFSDIR}
    make
}

function sdimages.getSources() {
    cp -r ${INPUTDIRSRCDIR}/** ${INPUTDIR}
}

function sdimages.build() {
    local LABEL=$1
    dd if=/dev/zero of=${SDIMGSDIR}/disk.img count=50 bs=1M
    parted -a minimal ${SDIMGSDIR}/disk.img mklabel msdos
    parted -a minimal ${SDIMGSDIR}/disk.img mkpart primary fat32 0% 100%
    mkdir -p ${SDIMGSDIR}/disk-extracted
    ${DEPENDENCIES_PARTFSDIR}/build/bin/partfs -o dev=${SDIMGSDIR}/disk.img ${SDIMGSDIR}/disk-extracted
    echo 'mtools_skip_check=1' >~/.mtoolsrc
    mkfs.vfat -n ${LABEL} ${SDIMGSDIR}/disk-extracted/p1
    mcopy -i ${SDIMGSDIR}/disk-extracted/p1 ${INPUTDIR}/** ::
}

function sdimages.package() {
    cp ${SDIMGSDIR}/disk.img ${DISTDIR}/out.img
}
```

## Aarch64 Docs Extension Concepts

```bash
# Create UEFI iPXE network bootloader for IMG
curl -H 'Content-Type: application/json' \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/mainscripts/1",
    "platform": "bin-arm64-efi",
    "driver": "snp",
    "extension": "efi"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes'
```

```bash
# Create U-Boot media bootloader UEFI aarch64
curl -H 'Content-Type: application/json' \
    -d '{
    "platform": "aarch64",
    "target": "rpi_3_defconfig",
    "fragment": "ubootBin",
    "script": "load mmc 0:1 0x0020000 snp.efi\nbootefi 0x0020000\n"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/uboots'
```

```bash
# Create U-Boot media bootloader UEFI aarch64 IMG
curl -H 'Content-Type: application/json' \
    -d '{
    "platform": "arm64",
    "target": "rpi_3_defconfig",
    "fragment": "ubootCmdImg",
    "script": "load mmc 0:1 0x0020000 snp.efi\nbootefi 0x0020000\n"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/uboots'
```

```bash
# Create non-free Raspberry Pi 3 bootcodeBin
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "bootcode.bin"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares'
```

```bash
# Create non-free Raspberry Pi 3 fixupDat
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "fixup.dat"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares'
```

```bash
# Create non-free Raspberry Pi 3 startElf
curl -H 'Content-Type: application/json' \
    -d '{
    "fragment": "start.elf"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares'
```

```bash
# Get UEFI iPXE network bootloader status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/ipxes/1'
```

```bash
# Get U-Boot UEFI aarch64 status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/uboots/1'
# Get U-Boot UEFI aarch64 IMG status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/uboots/2'
```

```bash
# Get non-free Raspberry Pi 3 bootcodeBin status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares/1'
# Get non-free Raspberry Pi 3 fixupDat status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares/2'
# Get non-free Raspberry Pi 3 startElf status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares/3'
```

```bash
# Create non-free Raspberry Pi 3 patches
curl -H 'Content-Type: application/json' \
    -d '{
    ixpeEfiUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/ipxes/345ttr/snp.efi",
    bootcodeBinUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/rpi3firmwares/234df3/bootcode.bin",
    fixupDatUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/rpi3firmwares/34rd/fixup.dat",
    startElfUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/rpi3firmwares/234r/start.elf",
    ubootBinUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/uboots/sdf/uboot.bin",
    ubootCmdImgUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/uboots/wedss/boot.scr",
    script: "arm_64bit=1\ndevice_tree_address=0x100\ndevice_tree_end=0x8000"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3patches'
```

```bash
# Get non-free Raspberry Pi 3 patches status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3patches/1'
```

```bash
# Create SD image
curl -H 'Content-Type: application/json' \
    -d '{
    label: "Cluster Platform Provisioner IMG",
    artifactsZipUrl: "http://services.provisioner.sandbox.cloud.alphahorizon.io:30004/rpi3patches/234df3/patches.zip"
}' \
    'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sdimages'
```

```bash
# Get SD image status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/sdimages/1'
```

## Undercloud Objects Concept

```plaintext
+--------------------------------------+
|                                      |
|  Domains            + Create Domain  |
|                                      |
|  api1.sandbox.cloud.alphahorizon.io  |
|  api2.sandbox.cloud.alphahorizon.io  |
|                                      |
+--------------------------------------+

+--------------------------------------+
|                                      |
|  Compute              + Create Node  |
|                                      |
|  no1.sandbox.cloud.alphahorizon.sol  |
|  no2.sandbox.cloud.alphahorizon.sol  |
|  no3.sandbox.cloud.alphahorizon.sol  |
|  no4.sandbox.cloud.alphahorizon.sol  |
|  no5.sandbox.cloud.alphahorizon.sol  |
|                                      |
+--------------------------------------+

+---------------------------------------+
|                                       |
|  Networking         + Create Network  |
|                                       |
|  net1.sandbox.cloud.alphahorizon.sol  |
|  net2.sandbox.cloud.alphahorizon.sol  |
|                                       |
+---------------------------------------+

+---------------------------------------+
|                                       |
|  Volume Storage      + Create Volume  |
|                                       |
|  vol1.sandbox.cloud.alphahorizon.sol  |
|  vol2.sandbox.cloud.alphahorizon.sol  |
|  vol3.sandbox.cloud.alphahorizon.sol  |
|                                       |
+---------------------------------------+

+---------------------------------------+
|                                       |
|  Object Storage      + Create Bucket  |
|                                       |
|  obj1.sandbox.cloud.alphahorizon.sol  |
|  obj2.sandbox.cloud.alphahorizon.sol  |
|  obj3.sandbox.cloud.alphahorizon.sol  |
|  obj4.sandbox.cloud.alphahorizon.sol  |
|                                       |
+---------------------------------------+
```

## Undercloud Deployment Experiment

> Tested on: `fedora-29`, `ubuntu-18.04`

```bash
# To apply infrastructure:
export HCLOUD_SERVERS=("alphahorizonio-cloud--sandbox-node1" "alphahorizonio-cloud--sandbox-node2" "alphahorizonio-cloud--sandbox-node3" "alphahorizonio-cloud--sandbox-node4" "alphahorizonio-cloud--sandbox-node5")
export HCLOUD_SERVER_IMAGE="fedora-29" # or ubuntu-18.04
for server in "${HCLOUD_SERVERS[@]}"; do
    hcloud server rebuild --image "${HCLOUD_SERVER_IMAGE}" "${server}" &
done
export LOCALNODES=("116.203.140.202" "116.203.140.204" "116.203.49.163" "116.203.136.4" "116.203.140.203")
for localnode in "${LOCALNODES[@]}"; do
    ssh root@"${localnode}" 'cat /etc/os-release'
done
```

```bash
# To apply cluster:
env.config
export NETWORK_ID="159924d63032a4e7"
export API_ACCESS_TOKEN="G3nxjygB1GrdIMXsgJjYriXIbPCnEiMU"
zerotier.hosts.config "${LOCALNODES[@]}"
zerotier.config "${NETWORK_ID}" "${API_ACCESS_TOKEN}"
zerotier.apply
zerotier.interfaces.get
export REDHAT_MANAGERS=("10.243.227.134")
export REDHAT_WORKERS=("10.243.171.57" "10.243.241.144" "10.243.21.156" "10.243.26.26")
export DEBIAN_MANAGERS=()
export DEBIAN_WORKERS=()
export MANAGERS=("${REDHAT_MANAGERS[@]}" "${DEBIAN_MANAGERS[@]}")
export WORKERS=("${REDHAT_WORKERS[@]}" "${DEBIAN_WORKERS[@]}")
export GLOBALNODES=("${MANAGERS[@]}" "${WORKERS[@]}")
for globalnode in "${GLOBALNODES[@]}"; do
    ssh root@"${globalnode}" 'hostname'
done
kubeadm.redhat.config "${REDHAT_MANAGERS[@]}" "${REDHAT_WORKERS[@]}"
kubeadm.debian.config "${DEBIAN_MANAGERS[@]}" "${DEBIAN_WORKERS[@]}"
export JOIN_TOKEN="kggjyu.oibo4midrs8skfqx"
export KUBERNETES_VERSION="v1.13.4"
kubeadm.masters.config "${JOIN_TOKEN}" "${KUBERNETES_VERSION}"
kubeadm.masters.apply "${MANAGERS[@]}"
export DISCOVERY_TOKEN="0d06c41b8fa2db43bfd8be5daf525b814583f411bb930473bde3b80562d4e2b0"
kubeadm.nodes.config "${JOIN_TOKEN}" "${DISCOVERY_TOKEN}" "${MANAGERS[0]}:6443"
export KUBECONFIG_NAME="alphahorizonio-cloud--sandbox.yaml"
kubeconfig.get "${MANAGERS[0]}" "${KUBECONFIG_NAME}"
kubeconfig.activate "${KUBECONFIG_NAME}"
kubeconfig.test
export KUBEROUTER_VERSION="${KUBERNETES_VERSION}"
kuberouter.config "${KUBEROUTER_VERSION}"
kuberouter.apply "${MANAGERS[@]}"
kuberouter.patch "${MANAGERS[@]}"
kubeconfig.test
kubeadm.nodes.apply "${WORKERS[@]}"
kuberouter.patch "${WORKERS[@]}"
kubeconfig.test
export ROOK_RELEASE="release-0.9"
export ROOK_REPLICAS="3"
rook.config "${ROOK_RELEASE}" "${ROOK_REPLICAS}"
rook.apply
rook.get
```

```bash
# To delete:
rook.delete "${MANAGERS[@]}" "${WORKERS[@]}"
kuberouter.delete "${MANAGERS[@]}" "${WORKERS[@]}"
kubeadm.delete "${MANAGERS[@]}" "${WORKERS[@]}"
zerotier.delete "${MANAGERS[@]}" "${WORKERS[@]}"
```

```bash
# All functions:
# env

# env.config
function env.config() {
    export WORKSPACEDIR="${PWD}/workspaces/$(cat /proc/sys/kernel/random/uuid)"
    export ZEROTIERDIR="${WORKSPACEDIR}/zerotierdir"
    export KUBEADMDIR="${WORKSPACEDIR}/kubeadmdir"
    export ROOKDIR="${WORKSPACEDIR}/rookdir"
    mkdir -p "$WORKSPACEDIR"
    mkdir -p "$ZEROTIERDIR"
    mkdir -p "$KUBEADMDIR"
    mkdir -p "$ROOKDIR"
    echo 'Applied env:'
    tree "${WORKSPACEDIR}"
}

# zerotier

# zerotier.hosts.config 116.203.140.202 116.203.140.204 116.203.49.163 116.203.136.4 116.203.140.203
function zerotier.hosts.config() {
    git clone git@github.com:m4rcu5nl/ansible-role-zerotier.git "${ZEROTIERDIR}"
    echo '[node]' >"${ZEROTIERDIR}/hosts.ini"
    for ip in "$@"; do
        echo "${ip}" >>"${ZEROTIERDIR}/hosts.ini"
    done
    echo 'Applied hosts:'
    cat "${ZEROTIERDIR}/hosts.ini"
}

# zerotier.config 159924d63032a4e7 G3nxjygB1GrdIMXsgJjYriXIbPCnEiMU
function zerotier.config() {
    local ID="${1}"
    local ACCESS_TOKEN="${2}"
    cat <<EOF >"${ZEROTIERDIR}/site.yaml"
---
- hosts: node
  vars:
     zerotier_network_id: "${ID}"
     zerotier_accesstoken: "${ACCESS_TOKEN}"
     zerotier_register_short_hostname: true

  roles:
     - { role: ., become: true }
EOF
    echo 'Applied playbook:'
    cat "${ZEROTIERDIR}/site.yaml"
}

# zerotier.apply
function zerotier.apply() {
    ansible-playbook -i "${ZEROTIERDIR}/hosts.ini" "${ZEROTIERDIR}/site.yaml" -u root -e 'ansible_python_interpreter=/usr/bin/python3'
}

# zerotier.delete 159924d63032a4e7
function zerotier.delete() {
    local ID="${1}"
    ansible -i "${ZEROTIERDIR}/hosts.ini" all -u root -m shell -a "zerotier-cli leave ${1}" -e 'ansible_python_interpreter=/usr/bin/python3'
}

# zerotier.interfaces.get
function zerotier.interfaces.get() {
    ansible -i "${ZEROTIERDIR}/hosts.ini" all -u root -m shell -a 'ip a | grep zt' -e 'ansible_python_interpreter=/usr/bin/python3'
}

# kubeadm

# kubeadm.redhat.config 10.243.101.52 10.243.229.214 10.243.230.206 10.243.80.21 10.243.80.21
function kubeadm.redhat.config() {
    for ip in "$@"; do
        ssh "root@${ip}" "command -v docker || curl https://get.docker.com | sh
cat <<EOF >/etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kube*
EOF
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
yum update -y
yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
cat <<EOF >/etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
mkdir -p /opt/cni/bin
ln -s /usr/libexec/cni/* /opt/cni/bin
sysctl --system
modprobe br_netfilter
systemctl enable --now systemd-resolved
systemctl restart systemd-resolved
systemctl enable --now docker
systemctl restart docker
systemctl enable --now kubelet
systemctl restart kubelet" &
    done
}

# kubeadm.debian.config 10.243.101.52 10.243.229.214 10.243.230.206 10.243.80.21 10.243.80.21
function kubeadm.debian.config() {
    for ip in "$@"; do
        ssh "root@${ip}" "apt-get update
apt-get install -y apt-transport-https curl
command -v docker || curl https://get.docker.com | sh
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
cat <<EOF >/etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
modprobe br_netfilter
systemctl enable --now systemd-resolved
systemctl restart systemd-resolved
systemctl enable --now docker
systemctl restart docker
systemctl enable --now kubelet
systemctl restart kubelet" &
    done
}

# kubeadm.masters.config kggjyu.oibo4midrs8skfqx v1.13.4
function kubeadm.masters.config() {
    export TOKEN="${1}"
    export KUBERNETES_VERSION="${2}"
}

# kubeadm.masters.apply 10.243.101.52
function kubeadm.masters.apply() {
    local IP="${1}"
    for ip in "$@"; do
        ssh "root@${ip}" "kubeadm init --pod-network-cidr 10.244.0.0/16 --apiserver-advertise-address ${IP} --kubernetes-version ${KUBERNETES_VERSION} --token ${TOKEN}; echo 'Join token:'; echo ${TOKEN}; echo 'Discovery token:'; openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'" &
    done
}

# kubeadm.nodes.config kggjyu.oibo4midrs8skfqx 6bbcca595ad76417a20cbc698c4f2e546375e86932b0c810912999dbce40a609 10.243.101.52:6443
function kubeadm.nodes.config() {
    export JOIN_TOKEN="${1}"
    export DISCOVERY_TOKEN="${2}"
    export APISERVER="${3}"
}

# kubeadm.nodes.apply 10.243.229.214 10.243.230.206 10.243.80.21 10.243.80.21
function kubeadm.nodes.apply() {
    for ip in "$@"; do
        ssh "root@${ip}" "kubeadm join --token ${JOIN_TOKEN} --discovery-token-ca-cert-hash sha256:${DISCOVERY_TOKEN} ${APISERVER}" &
    done
}

# kubeadm.delete 10.243.101.52 10.243.229.214 10.243.230.206 10.243.80.21 10.243.80.21
function kubeadm.delete() {
    for ip in "$@"; do
        ssh "root@${ip}" "kubeadm reset -f" &
    done
}

# kubeconfig

# kubeconfig.get 10.243.160.132 alphahorizonio-cloud--sandbox.yaml
function kubeconfig.get() {
    local MASTER_IP="${1}"
    local KUBECONFIG_NAME="${2}"
    scp "root@${MASTER_IP}:/etc/kubernetes/admin.conf" "${HOME}/.kube/${KUBECONFIG_NAME}"
    echo 'Get kubeconfig:':
    cat "${HOME}/.kube/${KUBECONFIG_NAME}"
}

# kubeconfig.activate alphahorizonio-cloud--sandbox.yaml
function kubeconfig.activate() {
    local KUBECONFIG_NAME="${1}"
    cp "${HOME}/.kube/${KUBECONFIG_NAME}" "${HOME}/.kube/config"
    echo 'Activated kubeconfig:'
    cat "${HOME}/.kube/${KUBECONFIG_NAME}"
}

# kubeconfig.test
function kubeconfig.test() {
    kubectl get nodes
}

# kuberouter

# kuberouter.config v1.13.4
function kuberouter.config() {
    export KUBEROUTER_VERSION="${1}"
}

# kuberouter.apply 10.243.99.94 10.243.140.249 10.243.165.160 10.243.170.87 10.243.160.132
function kuberouter.apply() {
    kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter-all-features.yaml
    kubectl -n kube-system delete ds kube-proxy
    for ip in "$@"; do
        ssh "root@${ip}" "docker run --privileged -v /lib/modules:/lib/modules:z --net=host k8s.gcr.io/kube-proxy-amd64:${KUBEROUTER_VERSION} kube-proxy --cleanup" &
    done
}

# kuberouter.patch 10.243.99.94 10.243.140.249 10.243.165.160 10.243.170.87 10.243.160.132
function kuberouter.patch() {
    for ip in "$@"; do
        ssh "root@${ip}" "cp -f /etc/resolv.conf /etc/resolv.conf.backup; rm /etc/resolv.conf; ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf" &
    done
}

# kuberouter.delete 10.243.99.94 10.243.140.249 10.243.165.160 10.243.170.87 10.243.160.132
function kuberouter.delete() {
    for ip in "$@"; do
        ssh "root@${ip}" "rm /etc/resolv.conf; cp -f /etc/resolv.conf.backup /etc/resolv.conf" &
    done
    kubectl delete -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter-all-features.yaml
}

# rook

# rook.config release-0.9 3
function rook.config() {
    local RELEASE="${1}"
    local SIZE="${2}"
    git clone git@github.com:rook/rook.git "${ROOKDIR}"
    git --git-dir="${ROOKDIR}/.git" checkout "${RELEASE}" --force
    cat <<EOF >"${ROOKDIR}/cluster/examples/kubernetes/ceph/storageclass.yaml"
apiVersion: ceph.rook.io/v1
kind: CephBlockPool
metadata:
  name: replicapool
  namespace: rook-ceph
spec:
  failureDomain: host
  replicated:
    size: ${SIZE}
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: rook-ceph-block
provisioner: ceph.rook.io/block
parameters:
  blockPool: replicapool
  clusterNamespace: rook-ceph
EOF
    echo 'Configurated rook:'
    cat "${ROOKDIR}/cluster/examples/kubernetes/ceph/storageclass.yaml"
}

# rook.apply
function rook.apply() {
    kubectl apply -f "${ROOKDIR}/cluster/examples/kubernetes/ceph/operator.yaml"
    kubectl apply -f "${ROOKDIR}/cluster/examples/kubernetes/ceph/cluster.yaml"
    kubectl apply -f "${ROOKDIR}/cluster/examples/kubernetes/ceph/storageclass.yaml"
    kubectl patch storageclass rook-ceph-block -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
}

# rook.get
function rook.get() {
    kubectl -n rook-ceph-system get pods
    kubectl -n rook-ceph get pods
}

# rook.delete 10.243.99.94 10.243.140.249 10.243.165.160 10.243.170.87 10.243.160.132
function rook.delete() {
    kubectl delete -f "${ROOKDIR}/cluster/examples/kubernetes/ceph/storageclass.yaml"
    kubectl delete -f "${ROOKDIR}/cluster/examples/kubernetes/ceph/cluster.yaml"
    kubectl delete -f "${ROOKDIR}/cluster/examples/kubernetes/ceph/operator.yaml"
    for ip in "$@"; do
        ssh "root@${ip}" "rm -rf /var/lib/rook/ && echo \"Removed rook from ${ip}\"" &
    done
}

# rook.test.apply
function rook.test.apply() {
    kubectl apply -f "${ROOKDIR}/cluster/examples/kubernetes/mysql.yaml"
    kubectl apply -f "${ROOKDIR}/cluster/examples/kubernetes/wordpress.yaml"
}

# rook.test.get
function rook.test.get() {
    kubectl get pvc
}

# rook.test.delete
function rook.test.delete() {
    kubectl delete -f "${ROOKDIR}/cluster/examples/kubernetes/mysql.yaml"
    kubectl apply -f "${ROOKDIR}/cluster/examples/kubernetes/wordpress.yaml"
}
```
