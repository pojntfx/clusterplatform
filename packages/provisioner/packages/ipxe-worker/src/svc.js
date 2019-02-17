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
        workdir: `/tmp/ipxe/workdir/${job.data.artifactId}`
      });
      await job.progress(10);
      await ipxe.download();
      await job.progress(20);
      await ipxe.build();
      await job.progress(50);
      await ipxe.package();
      await job.progress(70);
      await ipxe.upload();
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
