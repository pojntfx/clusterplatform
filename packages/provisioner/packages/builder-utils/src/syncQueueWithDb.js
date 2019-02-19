module.exports = async ({ queueName, managerName, service, artifact, ctx }) => {
  const queue = service.getQueue(queueName);
  queue.on("global:progress", async (jobInQueueId, progress) => {
    const jobInQueue = await queue.getJob(jobInQueueId);
    await service.logger.info(
      `Progress on ${artifact} artifact`,
      jobInQueue.data.artifactId,
      progress
    );
    const jobInDb = (await ctx.call(`${managerName}.find`, {
      query: {
        artifactId: jobInQueue.data.artifactId
      }
    }))[0];
    await ctx.call(`${managerName}.update`, {
      id: jobInDb.id,
      artifactId: jobInQueue.data.artifactId,
      progress,
      status: "working"
    });
  });
  queue.on("global:completed", async (jobInQueueId, res) => {
    const jobInQueue = await queue.getJob(jobInQueueId);
    await service.logger.info(
      `${artifact} artifact done`,
      jobInQueue.data.artifactId,
      res
    );
    const jobInDb = (await ctx.call(`${managerName}.find`, {
      query: {
        artifactId: jobInQueue.data.artifactId
      }
    }))[0];
    return await ctx.call(`${managerName}.update`, {
      id: jobInDb.id,
      artifactId: jobInQueue.data.artifactId,
      status: "done"
    });
  });
};
