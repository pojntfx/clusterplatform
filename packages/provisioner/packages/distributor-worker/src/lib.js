const shell = require("shelljs");
const download = require("download");
const ip = require("./ip");
const { fs } = require("@clusterplatform/builder-utils");

const CONFIGTMPL = `# enable logs if required
#log-queries
#log-dhcp

# disable DNS server
# port=0

# listen on PXEBOOT vlan (vlan110) only
listen-address=10.0.0.1
interface=INTERFACE

# enable built-in tftp server
enable-tftp
tftp-root=TFTPROOT


# DHCP range 10.0.0.200 ~ 10.0.0.250
dhcp-range=10.0.0.200,10.0.0.250,255.255.255.0,24h

# Default gateway
dhcp-option=3,10.0.0.1

# Domain name - DOMAIN
dhcp-option=15,DOMAIN

# Broadcast address
dhcp-option=28,10.0.0.255

# Set interface MTU to 9000 bytes (jumbo frame)
# Enable only when your network supports it
# dhcp-option=26,9000

# Tag dhcp request from iPXE
dhcp-match=set:ipxe,175

# inspect the vendor class string and tag BIOS client
dhcp-vendorclass=BIOS,PXEClient:Arch:00000

# Boot file - Legacy BIOS client
dhcp-boot=tag:!ipxe,tag:BIOS,ipxe.kpxe,10.1.0.1

# Boot file - EFI client
# at the moment all non-BIOS clients are considered
# EFI client
dhcp-boot=tag:!ipxe,tag:!BIOS,ipxe.efi,10.1.0.1`;

module.exports = class {
  constructor({
    artifactId,
    device,
    downloaddir,
    builddir,
    packagedir,
    configurationdir
  }) {
    this.artifactId = artifactId;
    this.device = device;
    this.downloaddir = `${downloaddir}/${this.artifactId}`;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.packagedir = `${packagedir}/${this.artifactId}`;
    this.configurationdir = `${configurationdir}/${this.artifactId}`;
    shell.mkdir("-p", this.downloaddir);
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.packagedir);
    shell.mkdir("-p", this.configurationdir);
  }

  async download({ ipxePxeUefiUrl, ipxePxeBiosUrl }) {
    await download(ipxePxeUefiUrl, this.downloaddir);
    await download(ipxePxeBiosUrl, this.downloaddir);
  }

  async build() {
    await shell.cp(`${this.downloaddir}/ipxe.efi`, `${this.builddir}/ipxe.efi`);
    await shell.cp(
      `${this.downloaddir}/ipxe.kpxe`,
      `${this.builddir}/ipxe.kpxe`
    );
  }

  async package() {
    await shell.cp(`${this.builddir}/ipxe.efi`, `${this.packagedir}/ipxe.efi`);
    await shell.cp(
      `${this.builddir}/ipxe.kpxe`,
      `${this.packagedir}/ipxe.kpxe`
    );
  }

  async configureNetwork() {
    await ip.addIpAddressToInterface("10.0.0.1/24", this.device);
    await ip.setInterfaceStatus("up", this.device);
  }

  async configureDnsmasq(domain) {
    const script = CONFIGTMPL.replace(/INTERFACE/g, this.device)
      .replace(/DOMAIN/g, domain)
      .replace(/TFTPROOT/g, this.packagedir);
    await fs.writeFile(`${this.configurationdir}/dnsmasq.conf`, script);
  }

  async getScript() {
    return await shell.cat(`${this.configurationdir}/dnsmasq.conf`);
  }
};
