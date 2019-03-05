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

```bash
# Run development version in Kubernetes
cd ../../ && skaffold dev -p provisioner--dev
```

Now, you can either use the REST api directly on [localhost:3000/api](http://localhost:3000/api) or import the [Insomnia Export](./packages/insomnia/src/workspace.json) into [Insomnia](https://insomnia.rest/).

If you want to run a `distributor-worker` standalone and then connect to the rest of the services (i.e. to provision machines in your home network, a remote location etc. while still doing all the heavy lifting (i.e. building the necessary artifacts) in a powerful cloud Kubernetes cluster), run the following:

```bash
# Some values below might be outdated or have to adapted
docker run --env TRANSPORTER=nats://46.101.114.216:30002 --env NPM_USER=verdaccio-user --env NPM_PASS=verdaccio-password --env NPM_EMAIL=verdaccio-user@example.com --env NPM_REGISTRY=http://46.101.114.216:30004 --env CLUSTERPLATFORM_DISTRIBUTOR_TAG=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-pojtinger-felix-local --cap-add=NET_ADMIN --net=host registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:085e550-dirty
```

Artifacts can be downloaded from `http://46.101.114.216:30900/${artifactName}/${artifactId}/${filename}`, where `46.101.114.216` is one of the Kubernetes nodes' IP, `${artifactName}` is the plural of an artifact such as `grubs` or `syslinuxs`, `{artifactId}` is the artifact's ID which can be found using the corresponding artifact's REST endpoint and `${filename}` is the actual file's name, such as `ipxe.efi`.

## More

See [Home](../site/src/index.md).
