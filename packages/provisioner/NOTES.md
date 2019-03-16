# Cluster Platform Provisioner Notes

## Tag View

```plaintext
+----------------------------------------------------+
|                                                    |
|  # felix.pojtinger.swabia.sol                      |
|                                                    |
|  Label:  Felix Pojtinger, Swabia, Sol Bootmedium   | (input)
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
  "tag": "felix.pojtinger.swabia.sol",
  "label": "Felix Pojtinger, Swabia, Sol Bootmedium",
  "script": "#!ipxe\nautoboot"
}
```

## GET Endpoints

```plaintext
GET /tags/1 (there is no "tag metaservice" that aggregates!)
GET /bootruntimes?tag=felix.pojtinger.swabia.sol
GET /distributors?tag=felix.pojtinger.swabia.sol
GET /grubs?tag=felix.pojtinger.swabia.sol
GET /ipxes?tag=felix.pojtinger.swabia.sol
GET /isos?tag=felix.pojtinger.swabia.sol
GET /kickstarts?tag=felix.pojtinger.swabia.sol
GET /localnodes?tag=felix.pojtinger.swabia.sol
GET /mainscripts?tag=felix.pojtinger.swabia.sol
GET /postbootscripts?tag=felix.pojtinger.swabia.sol
GET /prebootscripts?tag=felix.pojtinger.swabia.sol
GET /sshkeys?tag=felix.pojtinger.swabia.sol
GET /subscripts?tag=felix.pojtinger.swabia.sol
GET /syslinuxs?tag=felix.pojtinger.swabia.sol
GET /globalnodes?tag=felix.pojtinger.swabia.sol
GET /networks?tag=felix.pojtinger.swabia.sol
```

## POST Endpoints

```plaintext
POST /bootruntime?tag=felix.pojtinger.swabia.sol
POST /distributors?tag=felix.pojtinger.swabia.sol&bootruntime=felix.pojtinger.swabia.sol
POST /grubs?tag=felix.pojtinger.swabia.sol
POST /ipxes?tag=felix.pojtinger.swabia.sol&bootruntime=felix.pojtinger.swabia.sol
POST /isos?tag=felix.pojtinger.swabia.sol&bootruntime=felix.pojtinger.swabia.sol
POST /kickstarts?tag=felix.pojtinger.swabia.sol
POST /localnodes?tag=felix.pojtinger.swabia.sol
POST /mainscripts?tag=felix.pojtinger.swabia.sol
POST /postbootscripts?tag=felix.pojtinger.swabia.sol
POST /prebootscripts?tag=felix.pojtinger.swabia.sol
POST /sshkeys?tag=felix.pojtinger.swabia.sol
POST /subscripts?tag=felix.pojtinger.swabia.sol
POST /syslinuxs?tag=felix.pojtinger.swabia.sol
POST /globalnodes?tag=felix.pojtinger.swabia.sol&network=felix.pojtinger.swabia.sol&localnodes=felix.pojtinger.swabia.sol
POST /networks?tag=felix.pojtinger.swabia.sol
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

## New Services Concepts

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
      await uboot.getSources(remote);
      await uboot.configure(script);
      if (fragment === "ubootCmdImg") {
        await uboot.buildImage({ ubootCmdImg });
      } else {
        await uboot.build({ platform, target }); // ubootBin
      }
      await uboot.buildImage({ ubootCmdImg });
      await uboot.package();
      return await uboot.upload();
    }
  }
};

const rpi3patchesWorker = {
  create: {
    params: {
      fragment: "string"
    },
    handler: async function(ctx) {
      const rpi3Patches = new Rpi3Patches();
      await rpi3Patches.getSources(remote);
      await rpi3Patches.build(fragment); // bootcodeBin, fixupDat, startElf
      await rpi3Patches.package();
      return await rpi3Patches.upload();
    }
  }
};

const rpi3imagesWorker = {
  create: {
    params: {
      bootcodeBinUrl: "string",
      fixupDatUrl: "string",
      startElfUrl: "string",
      ubootBinUrl: "string",
      ubootCmdImgUrl: "string",
      script: "string"
    },
    handler: async function(ctx) {
      const rpi3Images = new rpi3Images();
      await rpi3Images.download({
        bootcodeBinUrl,
        fixupDatUrl,
        startElfUrl,
        ubootBinUrl,
        ubootCmdImgUrl
      });
      await rpi3Images.configure(script); // config.txt
      await rpi3Images.build();
      await rpi3Images.package();
      return await rpi3Images.upload();
    }
  }
};
```

## New Services Bash Implementation

```bash
function env.get_dependencies() {
    sudo dnf install uboot-tools gcc-aarch64-linux-gnu -y
}

function env.setup() {
    export WORKSPACE=${PWD}
}

function uboot.get_sources() {
    cd ${WORKSPACE}
    git clone git://git.denx.de/u-boot.git
}

function uboot.configure() {
    cd ${WORKSPACE}/u-boot
    cat >boot.cmd <<EOF
load mmc 0:1 0x0020000 snp.efi
bootefi 0x0020000
EOF
    sudo mkimage -C none -A arm64 -T script -d ${WORKSPACE}/u-boot/boot.cmd /mnt/rpi3-sd/boot.scr
}

function uboot.make() {
    cd ${WORKSPACE}/u-boot
    make CROSS_COMPILE=aarch64-linux-gnu- rpi_3_defconfig
    make CROSS_COMPILE=aarch64-linux-gnu- -j$(nproc) -s all
    cd ${WORKSPACE}
}

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

function rpi3firmware.get_sources() {
    cd ${WORKSPACE}
    git clone --depth 1 git://github.com/raspberrypi/firmware
}

function rpi3firmware.configure() {
    cat >config.txt <<EOF
arm_64bit=1
device_tree_address=0x100
device_tree_end=0x8000
EOF
}

function sd.mount() {
    sudo mkdir -p /mnt/rpi3-sd
    sudo mount /dev/sdd1 /mnt/rpi3-sd
}

function sd.configure() {
    cd ${WORKSPACE}/u-boot
    cat >boot.cmd <<EOF
load mmc 0:1 0x0020000 snp.efi
bootefi 0x0020000
EOF
    cat >config.txt <<EOF
arm_64bit=1
device_tree_address=0x100
device_tree_end=0x8000
EOF
    cd ${WORKSPACE}
}

function sd.copy() {
    sudo cp ${WORKSPACE}/firmware/boot/{bootcode.bin,fixup.dat,start.elf} /mnt/rpi3-sd
    sudo cp ${WORKSPACE}/u-boot/u-boot.bin /mnt/rpi3-sd/kernel.img
    sudo cp ${WORKSPACE}/u-boot/config.txt /mnt/rpi3-sd/config.txt
    sudo cp ${WORKSPACE}/ipxe/src/bin-arm64-efi/snp.efi /mnt/rpi3-sd/snp.efi
    sudo mkimage -C none -A arm64 -T script -d ${WORKSPACE}/u-boot/boot.cmd /mnt/rpi3-sd/boot.scr
}

function sd.unmount() {
    sync
    sudo umount /mnt/rpi3-sd
}
```

## Images Worker Bash Implementation

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
    dd if=/dev/zero of=${SDIMGSDIR}/disk.img count=50 bs=1M
    parted -a minimal ${SDIMGSDIR}/disk.img mklabel msdos
    parted -a minimal ${SDIMGSDIR}/disk.img mkpart primary fat32 0% 100%
    mkdir -p ${SDIMGSDIR}/disk-extracted
    ${DEPENDENCIES_PARTFSDIR}/build/bin/partfs -o dev=${SDIMGSDIR}/disk.img ${SDIMGSDIR}/disk-extracted
    echo 'mtools_skip_check=1' >~/.mtoolsrc
    mkfs.vfat -n BOOT ${SDIMGSDIR}/disk-extracted/p1
    mcopy -i ${SDIMGSDIR}/disk-extracted/p1 ${INPUTDIR}/** ::
}

function sdimages.package() {
    cp ${SDIMGSDIR}/disk.img ${DISTDIR}/out.img
}
```
