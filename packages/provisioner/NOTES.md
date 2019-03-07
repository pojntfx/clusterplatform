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
