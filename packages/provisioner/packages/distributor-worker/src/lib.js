import shell from "shelljs";
import download from "download";
import ip from "./ip";
import { fs } from "@clusterplatform/builder-utils";
import pm2 from "pm2";

const CONFIGTMPL = `port=0
dhcp-range=RANGE,proxy,255.255.255.0
dhcp-option=vendor:PXEClient,6,2b
dhcp-no-override
pxe-service=X86PC, "Boot iPXE", ipxe.kpxe
pxe-service=X86-64_EFI, "Boot iPXE", ipxe.efi
enable-tftp
tftp-root=TFTPROOT`;

export default class {
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

  async configureDnsmasq(range) {
    const script = CONFIGTMPL.replace(/INTERFACE/g, this.device)
      .replace(/RANGE/g, range)
      .replace(/TFTPROOT/g, this.packagedir);
    await fs.writeFile(`${this.configurationdir}/dnsmasq.conf`, script);
  }

  async getScript() {
    return await shell.cat(`${this.configurationdir}/dnsmasq.conf`);
  }

  async start(name) {
    return new Promise(resolve => {
      pm2.connect(() => {
        pm2.start(
          {
            script: "dnsmasq",
            args: `-k -C "${this.configurationdir}/dnsmasq.conf"`,
            name
          },
          (_, res) => {
            pm2.disconnect();
            resolve(res);
          }
        );
      });
    });
  }

  async stop(name) {
    return new Promise(resolve => {
      pm2.connect(() => {
        pm2.stop(name, (_, res) => {
          pm2.disconnect();
          resolve(res);
        });
      });
    });
  }
}
