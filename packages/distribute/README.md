# Cluster Platform Distribute

Lean distribution of your platform.

## Features

### Infrastructure

- [Provisioner](../provisioner/README.md): Hosts as a service
- [Runtime](../runtime/README.md): The host operating system (Fedora)
- [Undercloud](../undercloud/README.md): Compute, networking and storage on a bare-metal/VM-level (oVirt/Ceph)
- [Overcloud](../overcloud/README.md): Compute, networking and storage on a deployment/service/pvc level (Kubernetes)
- [Network](../network/README.md): Alternative, decentralized interplanetary communication network (`batman-adv`)

### Devices

- [Satellite](../satellite/README.md): Lean node that can serve as a host
- [Center](../center/README.md): Specialized node to be used as a control center
- [Station](../station/README.md): End-user node

### Modules

- [Compute](../compute/README.md): Provides compute, storage and networking resources
- [Communications](../communications/README.md): Connects to the network
- [Propulsion](../propulsion/README.md): Translate a node (as in geometry)
- [Rotation](../rotation/README.md): Rotate a node
- [Navigation](../navigation/README.md): Provide navigation resource
- [Energy](../energy/README.md): Provide power for the other modules

## More

See [Platform README](../../README.md).
