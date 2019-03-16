import Queue from "moleculer-bull";
import Rpi3Firmware from "./lib";
import { Errors } from "moleculer";

export default {
  name: "rpi3firmware-worker",
  queues: {
    "rpi3firmware-worker.create": async function(job) {
      await this.logger.info("Creating new rpi3firmware artifact", job.data);
      await job.progress(0);
      const rpi3firmware = new Rpi3Firmware({
        downloaddir: `/tmp/clusterplatform/app/rpi3firmware/downloaddir`,
        builddir: `/tmp/clusterplatform/app/rpi3firmware/builddir`,
        distdir: `/tmp/clusterplatform/app/rpi3firmware/distdir`,
        artifactId: job.data.artifactId
      });
      await job.progress(10);
      await rpi3firmware.download({
        remote: "git://github.com/raspberrypi/firmware"
      });
      await job.progress(30);
      const builded = await rpi3firmware.build(job.data);
      if (!builded) {
        this.logger.error("ERR_FRAGMENT_NOT_FOUND", job.data);
        throw new Errors.MoleculerError(
          "Fragment not found",
          404,
          "ERR_FRAGMENT_NOT_FOUND"
        );
      } else {
        await job.progress(50);
        await rpi3firmware.package();
        await job.progress(80);
        await rpi3firmware.upload({
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
