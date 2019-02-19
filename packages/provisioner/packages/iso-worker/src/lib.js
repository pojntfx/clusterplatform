const download = require("download");
const { zip, fs, xorriso } = require("@clusterplatform/builder-utils");
const shell = require("async-shelljs");

module.exports = class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = downloaddir;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    this.ipxedir = `${this.downloaddir}/ipxe`;
    this.grubdir = `${this.downloaddir}/grub`;
    this.syslinuxdir = `${this.downloaddir}/isolinux`;
    shell.mkdir("-p", this.ipxedir);
    shell.mkdir("-p", this.grubdir);
    shell.mkdir("-p", this.syslinuxdir);
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.distdir);
  }

  async download({
    ipxeUefiUrl,
    ipxeBiosUrl,
    grubImgUrl,
    grubEfiUrl,
    ldLinuxUrl,
    isolinuxBinUrl,
    isohdpfxBinUrl
  }) {
    await download(ipxeUefiUrl, this.ipxedir);
    await download(ipxeBiosUrl, this.ipxedir);
    await download(grubImgUrl, this.grubdir);
    await download(grubEfiUrl, this.grubdir);
    await download(ldLinuxUrl, this.syslinuxdir);
    await download(isolinuxBinUrl, this.syslinuxdir);
    await download(isohdpfxBinUrl, this.syslinuxdir);
  }

  async build() {
    await shell.cp("-r", this.downloaddir, this.builddir);
  }

  async extractGrubEfi() {
    await zip.extractArchive(`${this.grubdir}/grub.zip`, this.downloaddir);
    await shell.rm(`${this.grubdir}/grub.zip`);
  }

  async configureGrub({ label }) {
    this.label = label;
    await fs.writeFile(
      `${this.grubdir}/grub.cfg`,
      `set default=1
set timeout=1

menuentry "iPXE" {
chainloader /ipxe/ipxe.efi
}`
    );
    await shell.touch(
      `${this.builddir}/${label
        .split(" ")
        .join("_")
        .toLowerCase()}`
    );
  }

  async configureSyslinux() {
    await fs.writeFile(
      `${this.syslinuxdir}/isolinux.cfg`,
      `default iPXE
            label iPXE
kernel /ipxe/ipxe.lkrn`
    );
  }

  async package() {
    this.localFilename = "dist.iso";
    this.remoteFilename = `${this.artifactId}/dist.iso`;
    await xorriso.createBootableIso({
      src: this.builddir,
      isohdpfxBinPath: `${this.builddir}/isolinux/isohdpfx.bin`,
      bootCatPath: `isolinux/boot.cat`,
      isolinuxBinPath: "isolinux/isolinux.bin",
      isolinuxBinPath: "grub/grub.img",
      label: this.label,
      dest: `${this.distdir}/${this.localFilename}`
    });
  }

  async upload({ endpoint, port, region, bucket, accessKey, secretKey }) {
    const client = new Client({
      endPoint: endpoint,
      port,
      accessKey,
      secretKey,
      useSSL: false
    });
    const download = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["s3:GetBucketLocation", "s3:ListBucket"],
          Effect: "Allow",
          Principal: {
            AWS: ["*"]
          },
          Resource: [`arn:aws:s3:::${bucket}`],
          Sid: ""
        },
        {
          Action: ["s3:GetObject"],
          Effect: "Allow",
          Principal: {
            AWS: ["*"]
          },
          Resource: [`arn:aws:s3:::${bucket}/*`],
          Sid: ""
        }
      ]
    };
    return new Promise(resolve =>
      client.bucketExists(bucket, (_, exists) =>
        exists
          ? client.fPutObject(
              bucket,
              this.remoteFilename,
              `${this.distdir}/${this.localFilename}`,
              {
                "Content-Type": "application/octet-stream"
              },
              () =>
                client.setBucketPolicy(bucket, JSON.stringify(download), () =>
                  resolve(true)
                )
            )
          : client.makeBucket(bucket, region, () =>
              client.fPutObject(
                bucket,
                this.remoteFilename,
                `${this.distdir}/${this.localFilename}`,
                {
                  "Content-Type": "application/octet-stream"
                },
                () =>
                  client.setBucketPolicy(bucket, JSON.stringify(download), () =>
                    resolve(true)
                  )
              )
            )
      )
    );
  }
};
