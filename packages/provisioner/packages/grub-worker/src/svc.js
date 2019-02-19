const Queue = require("moleculer-bull");
const Grub = require("./lib");

module.exports = {
  name: "grub-worker",
  queues: {
    "grub-worker.create": async function(job) {
      await this.logger.info("Creating new grub artifact", job.data);
      await job.progress(0);
      const grub = new Grub({
        downloaddir: "/tmp/grub/downloaddir",
        builddir: `/tmp/grub/builddir`,
        distdir: `/tmp/grub/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      await grub.download({
        remote: "https://github.com/madnight/grub.git"
      });
      await job.progress(20);
      await grub.autogen();
      await job.progress(30);
      await grub.configure(job.data);
      await job.progress(40);
      await grub.make();
      await job.progress(50);
      await grub.install();
      await job.progress(60);
      await grub.makeImage();
      await job.progress(70);
      if (job.data.fragment === "img") {
        await grub.packageImg();
      } else {
        await grub.packageFolder();
      }
      await job.progress(80);
      await grub.upload({
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
