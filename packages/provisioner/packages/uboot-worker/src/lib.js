import { Client } from "minio";
import * as shell from "async-shelljs";
import { git, autotools, fs, mkimage } from "@clusterplatform/builder-utils";

export default class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = downloaddir;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    shell.mkdir("-p", this.downloaddir);
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.distdir);
  }

  async download({ remote }) {
    await git.cloneOrPullRepo(remote, this.downloaddir, "--depth 1");
  }

  async buildUbootBin({ platform, target }) {
    this.localFilename = "u-boot.bin";
    this.remoteFilename = `${this.artifactId}/kernel.img`;
    await shell.cd(`${this.downloaddir}`);
    switch (platform) {
      case "aarch64":
        await autotools.make(target, `CROSS_COMPILE=aarch64-linux-gnu-`);
        await autotools.make(
          "all",
          `CROSS_COMPILE=aarch64-linux-gnu- -j$(nproc) -s`
        );
      default:
        await autotools.make(target);
        await autotools.make("all");
    }
    return await shell.cp(
      `${this.downloaddir}/${this.localFilename}`,
      `${this.builddir}/${this.localFilename}`
    );
  }

  async buildUbootCmdImg({ platform, script }) {
    this.localFilename = "boot.cmd";
    this.remoteFilename = `${this.artifactId}/boot.scr`;
    await fs.writeFile(`${this.downloaddir}/boot.cmd`, script);
    return await mkimage.mkimage({
      platform,
      src: `${this.downloaddir}/${this.localFilename}`,
      dest: `${this.builddir}/${this.localFilename}`
    });
  }

  async package() {
    return await shell.cp(
      `${this.builddir}/${this.localFilename}`,
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
