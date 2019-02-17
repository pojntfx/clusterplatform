const Queue = require("moleculer-bull");
const Ipxe = require("./lib");

module.exports = {
  name: "ipxe-worker",
  queues: {
    "ipxe-worker.create": async function(job) {
      await this.logger.info("Creating new Ipxe", job.data);
      await job.progress(0);
      const ipxe = new Ipxe({
        downloaddir: "/tmp/ipxe/downloaddir",
        builddir: `/tmp/ipxe/builddir`,
        distdir: `/tmp/ipxe/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      await ipxe.download();
      await job.progress(20);
      await ipxe.build({
        driver: "ipxe",
        extension: "lkrn"
      });
      await job.progress(50);
      await ipxe.package();
      await job.progress(70);
      await ipxe.upload({
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
