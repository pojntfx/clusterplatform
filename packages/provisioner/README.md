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
--data '{"text":"#!ipxe\nmenu Choose Script\nitem mainsubscriptserver_fedora29 Main Sub Script Server Fedora 29\nchoose --default mainsubscriptserver_fedora29 --timeout 3000 server &&  goto ${server}\n:mainsubscriptserver_fedora29\ndhcp\nchain http://46.101.114.216:30300/api/subscripts/1\n"}' \
http://46.101.114.216:30300/api/mainscripts
```

### Create Subscript

```bash
curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"text":"#!ipxe\nmenu Choose Script\nitem subscript Fedora 29\nchoose --default subscript --timeout 3000 subscript && goto ${subscript}\n:subscript\ndhcp\nset base http://dl.fedoraproject.org/pub/fedora/linux/releases/29/Server/x86_64/os\nkernel ${base}/images/pxeboot/vmlinuz initrd=initrd.img repo=${base}\ninitrd ${base}/images/pxeboot/initrd.img\nboot\n"}' \
http://46.101.114.216:30300/api/subscripts
```

### Get Bootruntime Status

Both should include `"status": "done"`.

```bash
curl http://46.101.114.216:30300/api/ipxes/1
curl http://46.101.114.216:30300/api/ipxes/2
```

### Run Distributor(s)

Run this on a node/multiple nodes that is/are in the same network as the hosts you want to provision. You may run as many instances of `distributor-worker` as you like; when deploying a bootruntime, all distributors with the specified `CLUSTERPLATFORM_DISTRIBUTOR_TAG` will be used.

```bash
docker run --env TRANSPORTER=nats://46.101.114.216:30002 --env NPM_USER=verdaccio-user --env NPM_PASS=verdaccio-password --env NPM_EMAIL=verdaccio-user@example.com --env NPM_REGISTRY=http://46.101.114.216:30004 --env CLUSTERPLATFORM_DISTRIBUTOR_TAG=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local --cap-add=NET_ADMIN --net=host registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:0c33557
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
--data '{"distributorTags":["sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local"],"device":"enp0s25","domain":"sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local"}' \
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

Now, connect hosts to the network, set them to `Network Boot` and turn them on.

## Technical Overview

```bash
# Run development version in Kubernetes
cd ../../ && skaffold dev -p provisioner--dev
```

Now, you can either use the REST api directly on [localhost:3000/api](http://localhost:3000/api) or import the [Insomnia Export](./packages/insomnia/src/workspace.json) into [Insomnia](https://insomnia.rest/).

If you want to run a `distributor-worker` standalone and then connect to the rest of the services (i.e. to provision machines in your home network, a remote location etc. while still doing all the heavy lifting (i.e. building the necessary artifacts) in a powerful cloud Kubernetes cluster), run the following:

```bash
docker run --env TRANSPORTER=nats://46.101.114.216:30002 --env NPM_USER=verdaccio-user --env NPM_PASS=verdaccio-password --env NPM_EMAIL=verdaccio-user@example.com --env NPM_REGISTRY=http://46.101.114.216:30004 --env CLUSTERPLATFORM_DISTRIBUTOR_TAG=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local --cap-add=NET_ADMIN --net=host registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:0c33557
```

Artifacts can be downloaded from `http://46.101.114.216:30900/${artifactName}/${artifactId}/${filename}`, where `46.101.114.216` is one of the Kubernetes nodes' IP, `${artifactName}` is the plural of an artifact such as `grubs` or `syslinuxs`, `{artifactId}` is the artifact's ID which can be found using the corresponding artifact's REST endpoint and `${filename}` is the actual file's name, such as `ipxe.efi`.

## More

See [Home](../site/src/index.md).
