# Cluster Platform Provisioner

Hosts as a service.

## Features

- [ipxes](./packages/ipxe-manager/src/svc.js): Compile iPXEs
- [distributors](./packages/distributor-manager/src/svc.js): Distribute iPXEs

## Usage

### Deploy iPXE Using Distributor

```bash
# Deploy services
cd ../../
skaffold dev -p provisioner--dev
```

```bash
# Deploy distributor
docker run \
    -e TRANSPORTER=nats://134.209.52.222:30002 \
    -e NPM_USER=verdaccio-user \
    -e NPM_PASS=verdaccio-password \
    -e NPM_EMAIL=verdaccio-user@example.com \
    -e NPM_REGISTRY=http://134.209.52.222:30004 \
    -e CLUSTERPLATFORM_DISTRIBUTOR_ARTIFACTID=felix.pojtinger.swabia.sol \
    --cap-add=NET_ADMIN \
    --net=host \
    registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:03d8d86-dirty
```

```bash
# Create EFI iPXE for distributor
curl -H "Content-Type: application/json" \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://134.209.52.222:30300/api/mainscripts/1",
    "platform": "bin-x86_64-efi",
    "driver": "ipxe",
    "extension": "efi"
}' \
    http://134.209.52.222:30300/api/ipxes
```

```bash
# Create BIOS iPXE for distributor
curl -H "Content-Type: application/json" \
    -d '{
    "script": "#!ipxe\ndhcp\nchain http://134.209.52.222:30300/api/mainscripts/1",
    "platform": "bin-x86_64-pcbios",
    "driver": "ipxe",
    "extension": "kpxe"
}' \
    http://134.209.52.222:30300/api/ipxes
```

```bash
# Get EFI iPXE status
curl -G \
    --data-urlencode 'id=1' \
    http://134.209.52.222:30300/api/ipxes
# Get BIOS iPXE status
curl -G \
    --data-urlencode 'id=2' \
    http://134.209.52.222:30300/api/ipxes
# Get distributors
curl -G \
    --data-urlencode 'search=felix.pojtinger.swabia.sol' \
    --data-urlencode 'searchFields=artifactId' \
    http://134.209.52.222:30300/api/distributors
```

```bash
# Update EFI and BIOS iPXEs on distributor
curl -X PUT -H "Content-Type: application/json" \
    -d '{
    "ipxePxeUefiUrl": "http://134.209.52.222:30900/ipxes/bffaf7bb-b52f-4b19-99ba-d7d4fa25b28b/ipxe.efi",
    "ipxePxeBiosUrl": "http://134.209.52.222:30900/ipxes/cf6de9eb-2079-4708-98fc-6264f2a9c9af/ipxe.kpxe",
    "artifactId": 1,
    "device": "enp0s25",
    "range": "192.168.178.1"
}' \
    http://134.209.52.222:30300/api/distributors/1
```

```bash
# Update distributor status to off
curl -X PUT -H "Content-Type: application/json" \
    -d '{
    "on": false,
    "artifactId": 1
}' \
    http://134.209.52.222:30300/api/distributors/1/status
```

```bash
# Update distributor status to on
curl -X PUT -H "Content-Type: application/json" \
    -d '{
    "on": true,
    "artifactId": 1
}' \
    http://134.209.52.222:30300/api/distributors/1/status
```
