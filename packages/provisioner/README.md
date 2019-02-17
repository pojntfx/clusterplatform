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

## More

See [Home](../site/src/index.md).
