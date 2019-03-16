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
# Get U-Boot UEFI aarch64 status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/uboots/1'
# Get U-Boot UEFI aarch64 IMG status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/uboots/2'
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
# Get non-free Raspberry Pi 3 bootcodeBin status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares/1'
# Get non-free Raspberry Pi 3 fixupDat status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares/2'
# Get non-free Raspberry Pi 3 startElf status
curl 'http://services.provisioner.sandbox.cloud.alphahorizon.io:30002/api/rpi3firmwares/3'
```
