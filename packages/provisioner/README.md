# Cluster Platform Provisioner

Hosts as a service.

## Features

- [ipxes](./packages/ipxe-manager/src/svc.js): Compile iPXEs
- [distributors](./packages/distributor-manager/src/svc.js): Distribute iPXEs

## Usage

### Prepare for Distributor Deployment

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

### Prepare for ISO Deployment

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

```bash
# Get ISO status
curl 'http://134.209.52.222:30300/api/isos/1'
```

```bash
# Get ISO
curl -o 'dist.iso' \
    'http://134.209.52.222:30900/isos/b1cf7b64-8965-4be0-9b6c-50d3c62d63fd/dist.iso'
```
