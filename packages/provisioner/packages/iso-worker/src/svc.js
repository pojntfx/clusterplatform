import Queue from "moleculer-bull";
import Iso from "./lib";

export default {
  name: "iso-worker",
  queues: {
    "iso-worker.create": async function(job) {
      await this.logger.info("Creating new iso artifact", job.data);
      await job.progress(0);
      const iso = new Iso({
        downloaddir: "/tmp/clusterplatform/app/iso/downloaddir",
        builddir: `/tmp/clusterplatform/app/iso/builddir`,
        distdir: `/tmp/clusterplatform/app/iso/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      await iso.download(job.data);
      await job.progress(30);
      await iso.build();
      await job.progress(40);
      await iso.extractGrubEfi();
      await job.progress(50);
      await iso.configureGrub(job.data);
      await job.progress(70);
      await iso.configureSyslinux();
      await job.progress(80);
      await iso.package();
      await job.progress(90);
      await iso.upload({
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
