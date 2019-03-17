import Queue from "moleculer-bull";
import Rpi3Patch from "./lib";

export default {
  name: "rpi3patch-worker",
  queues: {
    "rpi3patch-worker.create": async function(job) {
      await this.logger.info("Creating new rpi3patch artifact", job.data);
      await job.progress(0);
      const rpi3patch = new Rpi3Patch({
        downloaddir: "/tmp/clusterplatform/app/rpi3patch/downloaddir",
        builddir: `/tmp/clusterplatform/app/rpi3patch/builddir`,
        distdir: `/tmp/clusterplatform/app/rpi3patch/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      await rpi3patch.download(job.data);
      await job.progress(30);
      await rpi3patch.build();
      await job.progress(40);
      await rpi3patch.configure(job.data.script);
      await job.progress(80);
      await rpi3patch.package();
      await job.progress(90);
      await rpi3patch.upload({
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
