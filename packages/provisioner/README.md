# Cluster Platform Provisioner

Hosts as a service.

## Features

- [iPXE](./packages/ipxe-manager/src/svc.js): Network bootloader as a service

## Usage

```bash
# Run in Kubernetes
skaffold dev
```

Now, you can either use the REST api directly on [localhost:3000/api](http://localhost:3000/api) or import the [Insomnia Export](./packages/insomnia/src/workspace.json) into [Insomnia](https://insomnia.rest/).

If you want to run a `distributor-worker` standalone and then connect to the rest of the services (i.e. to provision machines in your home network, a remote location etc.), run the following:

```bash
# Some values below might be outdated or have to adapted
docker run --env TRANSPORTER=nats://46.101.180.149:30002 --env NPM_USER=verdaccio-user --env NPM_PASS=verdaccio-password --env NPM_EMAIL=verdaccio-user@example.com --env NPM_REGISTRY=http://46.101.180.149:30004 --env CLUSTERPLATFORM_DISTRIBUTOR_TAG=sol-earth-eu-de-bw-fds-bbronn-hirschkopfweg-8-local --cap-add=NET_ADMIN --net=host registry.gitlab.com/clusterplatform/clusterplatform/distributor-worker:085e550-dirty
```

## More

See [Home](../site/src/index.md).
