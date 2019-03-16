import { Client } from "minio";
import * as shell from "async-shelljs";
import { git, autotools, fs } from "@clusterplatform/builder-utils";

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
    await git.cloneOrPullRepo(remote, this.downloaddir);
  }

  /**
   * Fix a bug where iPXE sleeps which breaks U-Boot support
   */
  async patchForAarch64() {
    await shell.touch(`${this.downloaddir}/src/config/local/nap.h`);
    await fs.writeFile(
      `${this.downloaddir}/src/config/local/nap.h`,
      `/* nap.h */
#undef NAP_EFIX86
#undef NAP_EFIARM
#define NAP_NULL`
    );
  }

  async build({ platform, driver, extension, script }) {
    this.localFilename = `${driver}.${extension}`;
    this.remoteFilename = `${this.artifactId}/${driver}.${extension}`;
    await fs.writeFile(`${this.downloaddir}/preseed.ipxe`, script);
    await shell.cd(`${this.downloaddir}/src/`);
    switch (platform) {
      case "bin-arm64-efi":
        await autotools.make(
          `${platform}/${driver}.${extension}`,
          `EMBED=${
            this.downloaddir
          }/preseed.ipxe NO_WERROR=1 CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm64`
        );
      default:
        await autotools.make(
          `${platform}/${driver}.${extension}`,
          `EMBED=${this.downloaddir}/preseed.ipxe NO_WERROR=1`
        );
    }
    return await shell.cp(
      `${this.downloaddir}/src/${platform}/${this.localFilename}`,
      `${this.builddir}/${this.localFilename}`
    );
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
