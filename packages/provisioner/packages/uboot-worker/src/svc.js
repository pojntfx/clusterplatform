import Queue from "moleculer-bull";
import Uboot from "./lib";

export default {
  name: "uboot-worker",
  queues: {
    "uboot-worker.create": async function(job) {
      await this.logger.info("Creating new uboot artifact", job.data);
      await job.progress(0);
      const uboot = new Uboot({
        downloaddir: "/tmp/clusterplatform/app/uboot/downloaddir",
        builddir: `/tmp/clusterplatform/app/uboot/builddir`,
        distdir: `/tmp/clusterplatform/app/uboot/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      if (job.data.fragment === "ubootBin") {
        await uboot.download({
          remote: "git://git.denx.de/u-boot.git"
        });
        await job.progress(30);
        await uboot.buildUbootBin(job.data);
      } else {
        await job.progress(30);
        await uboot.buildUbootCmdImg(job.data);
      }
      await job.progress(50);
      await uboot.package();
      await job.progress(70);
      await uboot.upload({
        endpoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT),
        region: process.env.MINIO_REGION,
        bucket: process.env.MINIO_BUCKET,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
      });
      await job.progress(100);
      return {
        artifactId: job.data.artifactId
      };
    }
  },
  mixins: [
    Queue({
      redis: {
        host: process.env.REDIS_HOST
      }
    })
  ]
};
