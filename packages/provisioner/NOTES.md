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
