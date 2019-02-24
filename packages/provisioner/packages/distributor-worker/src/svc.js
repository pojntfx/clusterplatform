module.exports = {
  name: "distributor-worker",
  started: async function() {
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let didRegister = false;

    while (!didRegister) {
      try {
        const localNode = await this.broker.getLocalNodeInfo();
        const localNodeData = (await this.broker
          .call("$node.list")
          .filter(node => (node.hostname = localNode.hostname)))[0];
        if (localNodeData.id) {
          if (
            await this.broker.call("distributor-manager.create", {
              nodeId: localNodeData.id,
              tag: process.env.CLUSTERPLATFORM_DISTRIBUTOR_TAG
            })
          ) {
            didRegister = true;
          } else {
            await sleep(2000);
          }
        } else {
          await sleep(2000);
        }
      } catch (e) {
        await this.logger.warning(
          "Distributor-worker can't connect to distributor-manager. Retrying every 2 seconds ..."
        );
        await sleep(2000);
      }
    }
  },
  actions: {
    update: {
      params: {
        ipxePxeUefiUrl: "string",
        ipxePxeBiosUrl: "string",
        device: "string",
        domain: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          `Updating distributor with data ${JSON.stringify(ctx.params)}`
        );
      }
    }
  }
};
