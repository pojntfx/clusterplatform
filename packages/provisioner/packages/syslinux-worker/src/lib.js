import { Client } from "minio";
import * as shell from "async-shelljs";
import { fs } from "@clusterplatform/builder-utils";

export default class {
  constructor({ artifactId, builddir, distdir }) {
    this.artifactId = artifactId;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.distdir);
  }

  async build({ fragment }) {
    this.localFilename = fragment;
    this.remoteFilename = `${this.artifactId}/${fragment}`;
    if (await fs.exists(`/usr/share/syslinux/${fragment}`)) {
      await shell.cp(`/usr/share/syslinux/${fragment}`, `${this.builddir}`);
      return true;
    } else {
      return false;
    }
  }

  async package() {
    await shell.cp(`${this.builddir}/${this.localFilename}`, `${this.distdir}`);
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
