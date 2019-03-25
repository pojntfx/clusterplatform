import download from "download";
import { zip, fs } from "@clusterplatform/builder-utils";
import * as shell from "async-shelljs";
import { Client } from "minio";

export default class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = `${downloaddir}/${this.artifactId}`;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.patchesdir = `${this.builddir}/patchesdir`;
    this.extracteddiskdir = `${this.builddir}/extracteddiskdir`;
    this.distdir = `${distdir}/${this.artifactId}`;
    shell.mkdir("-p", this.downloaddir);
    shell.mkdir("-p", this.patchesdir);
    shell.mkdir("-p", this.distdir);
  }

  download(artifactsZipUrl) {
    return new Promise(resolve => {
      download(artifactsZipUrl, this.downloaddir).then(() => resolve(true));
    });
  }

  async build(label) {
    await zip.extractArchive(
      `${this.downloaddir}/patches.zip`,
      this.patchesdir
    );
    await shell.exec(
      `dd if=/dev/zero of=${this.builddir}/disk.img count=50 bs=1M`
    );
    await shell.exec(
      `parted -a minimal ${this.builddir}/disk.img mklabel msdos`
    );
    await shell.exec(
      `parted -a minimal ${this.builddir}/disk.img mkpart primary fat32 0% 100%`
    );
    await shell.exec(
      `partfs -o dev=${this.builddir}/disk.img ${this.extracteddiskdir}`
    );
    await fs.writeFile(`${process.env.HOME}/.mtoolsrc`, "mtools_skip_check=1");
    await shell.exec(`mkfs.vfat -n ${label} ${this.extracteddiskdir}/p1`);
    await shell.exec(
      `mcopy -i ${this.extracteddiskdir}/p1 ${this.patchesdir}/** ::`
    );
  }

  async package() {
    this.localFilename = "dist.img";
    this.remoteFilename = `${this.artifactId}/dist.img`;
    await shell.cp(
      "-r",
      `${this.builddir}/disk.img`,
      `${this.distdir}/${this.localFilename}`
    );
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
