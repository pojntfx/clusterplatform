import download from "download";
import { zip, fs } from "@clusterplatform/builder-utils";
import * as shell from "async-shelljs";
import { Client } from "minio";

export default class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = `${downloaddir}/${this.artifactId}`;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    shell.mkdir("-p", this.downloaddir);
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.distdir);
  }

  download({
    ixpeEfiUrl,
    bootcodeBinUrl,
    fixupDatUrl,
    startElfUrl,
    ubootBinUrl,
    ubootCmdImgUrl
  }) {
    return new Promise(resolve => {
      download(ixpeEfiUrl, this.downloaddir).then(() =>
        download(bootcodeBinUrl, this.downloaddir).then(() =>
          download(fixupDatUrl, this.downloaddir).then(() =>
            download(startElfUrl, this.downloaddir).then(() =>
              download(ubootBinUrl, this.downloaddir).then(() =>
                download(ubootCmdImgUrl, this.downloaddir).then(() =>
                  resolve(true)
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

  async configure(script) {
    await fs.writeFile(`${this.builddir}/config.txt`, script);
  }

  async package() {
    this.localFilename = "patches.zip";
    this.remoteFilename = `${this.artifactId}/patches.zip`;
    await zip.createArchive(
      `${this.builddir}/**`,
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
