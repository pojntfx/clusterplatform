import { Client } from "minio";
import * as shell from "async-shelljs";
import {
  git,
  autotools,
  fs,
  grubMkImage,
  zip,
  mkDosFs,
  mcopy
} from "@clusterplatform/builder-utils";

export default class {
  constructor({ artifactId, downloaddir, builddir, distdir }) {
    this.artifactId = artifactId;
    this.downloaddir = downloaddir;
    this.builddir = `${builddir}/${this.artifactId}`;
    this.distdir = `${distdir}/${this.artifactId}`;
    shell.mkdir("-p", this.downloaddir);
    shell.mkdir("-p", `${this.builddir}/EFI/BOOT`);
    shell.mkdir("-p", `${this.builddir}/grub`);
    shell.mkdir("-p", this.distdir);
  }

  async download({ remote }) {
    await git.cloneOrPullRepo(remote, this.downloaddir);
  }

  async autogen() {
    await shell.cd(this.downloaddir);
    await autotools.autogen(".");
  }

  async configure({ platform, architecture, extension, label }) {
    this.platform = platform;
    this.architecture = architecture;
    this.extension = extension;
    this.label = label;
    await autotools.configure({
      path: ".",
      prefix: `${this.downloaddir}/out`,
      args: `--with-platform=${extension} --disable-werror`
    });
  }

  async make() {
    await autotools.make();
  }

  async install() {
    await autotools.makeInstall();
  }

  async makeImage() {
    // Create the embedded script
    await fs.writeFile(
      `${this.downloaddir}/embedded.cfg`,
      `search --file --set=root /${this.label
        .split(" ")
        .join("_")
        .toLowerCase()}
    if [ -e ($root)/grub/grub.cfg ]; then
        set prefix=($root)/grub
        configfile $prefix/grub/grub.cfg
    else
        echo "Could not find /grub/grub.cfg!"
    fi`
    );
    await shell.mkdir("-p", `${this.builddir}/EFI/BOOT`);
    await grubMkImage.makeImage({
      // Create the GRUB EFI executable
      pathToBinary: `${this.downloaddir}/out/bin/grub-mkimage`,
      platform: this.platform,
      root: this.builddir,
      architecture: this.architecture,
      configFile: `${this.downloaddir}/embedded.cfg`
    });
  }

  async packageImg() {
    this.localFilename = "grub.img";
    this.remoteFilename = `${this.artifactId}/grub.img`;
    await mkDosFs.makeDosFilesystem({
      label: this.label,
      dest: `${this.distdir}/grub.img`,
      size: 2048
    });
    await mcopy.mcopy({
      src: `${this.builddir}/EFI`,
      dest: `${this.distdir}/grub.img`
    });
  }

  async packageFolder() {
    this.localFilename = "grub.zip";
    this.remoteFilename = `${this.artifactId}/grub.zip`;
    await shell.cd(this.builddir);
    await zip.createArchive("EFI", `${this.distdir}/grub.zip`);
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
