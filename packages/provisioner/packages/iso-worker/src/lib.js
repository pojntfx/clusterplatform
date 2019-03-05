import download from "download";
import { zip, fs, xorriso } from "@clusterplatform/builder-utils";
import * as shell from "async-shelljs";
import { Client } from "minio";

export default class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = `${downloaddir}/${this.artifactId}`;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    this.ipxedownloaddir = `${this.downloaddir}/ipxe`;
    this.grubdownloaddir = `${this.downloaddir}/grub`;
    this.syslinuxdownloaddir = `${this.downloaddir}/isolinux`;
    shell.mkdir("-p", this.ipxedownloaddir);
    shell.mkdir("-p", this.grubdownloaddir);
    shell.mkdir("-p", this.syslinuxdownloaddir);
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.distdir);
  }

  download({
    ipxeUefiUrl,
    ipxeBiosUrl,
    grubImgUrl,
    grubEfiX64Url,
    grubEfiX86Url,
    ldLinuxUrl,
    isolinuxBinUrl,
    isohdpfxBinUrl
  }) {
    return new Promise(resolve => {
      download(ipxeUefiUrl, this.ipxedownloaddir).then(() =>
        download(ipxeBiosUrl, this.ipxedownloaddir).then(() =>
          download(grubImgUrl, this.grubdownloaddir).then(() =>
            download(grubEfiX64Url, `${this.grubdownloaddir}/grubx64`).then(
              () =>
                download(grubEfiX86Url, `${this.grubdownloaddir}/grubx86`).then(
                  () =>
                    download(ldLinuxUrl, this.syslinuxdownloaddir).then(() =>
                      download(isolinuxBinUrl, this.syslinuxdownloaddir).then(
                        () =>
                          download(
                            isohdpfxBinUrl,
                            this.syslinuxdownloaddir
                          ).then(() => resolve(true))
                      )
                    )
                )
            )
          )
        )
      );
    });
  }

  async build() {
    await shell.cp("-r", `${this.downloaddir}/*`, this.builddir);
  }

  async extractGrubEfi() {
    await zip.extractArchive(
      `${this.grubdownloaddir}/grubx64/grub.zip`,
      this.builddir
    );
    await zip.extractArchive(
      `${this.grubdownloaddir}/grubx86/grub.zip`,
      this.builddir
    );
    await shell.rm("-rf", `${this.builddir}/grub/grubx64`);
    await shell.rm("-rf", `${this.builddir}/grub/grubx86`);
  }

  async configureGrub({ label }) {
    this.label = label;
    await fs.writeFile(
      `${this.builddir}/grub/grub.cfg`,
      `set default=1
set timeout=1

menuentry "iPXE" {
chainloader /ipxe/ipxe.efi
}`
    );
    await shell.touch(
      `${this.builddir}/${this.label
        .split(" ")
        .join("_")
        .toLowerCase()}`
    );
  }

  async configureSyslinux() {
    await fs.writeFile(
      `${this.builddir}/isolinux/isolinux.cfg`,
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
      grubImgPath: "grub/grub.img",
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
}
