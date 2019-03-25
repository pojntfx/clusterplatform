import Queue from "moleculer-bull";
import Sdimage from "./lib";

export default {
  name: "sdimage-worker",
  queues: {
    "sdimage-worker.create": async function(job) {
      await this.logger.info("Creating new sdimage artifact", job.data);
      await job.progress(0);
      const sdimage = new Sdimage({
        downloaddir: "/tmp/clusterplatform/app/sdimage/downloaddir",
        builddir: `/tmp/clusterplatform/app/sdimage/builddir`,
        distdir: `/tmp/clusterplatform/app/sdimage/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      await sdimage.download(job.data.artifactsZipUrl);
      await job.progress(50);
      await sdimage.build(job.data.label);
      await job.progress(80);
      await sdimage.package();
      await job.progress(90);
      await sdimage.upload({
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
