const { Client } = require("minio");
const shell = require("shelljs");

module.exports = class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = downloaddir;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    shell.mkdir("-p", this.downloaddir);
    shell.mkdir("-p", this.builddir);
    shell.mkdir("-p", this.distdir);
  }

  async download() {}

  async build({ driver, extension }) {
    this.localFilename = `${driver}.${extension}`;
    this.remoteFilename = `${this.artifactId}/${driver}.${extension}`;
    return shell.exec(
      `echo "asdfasfdasdf" > ${this.builddir}/${this.localFilename}`
    );
  }

  async package() {
    return shell.cp(
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
};
