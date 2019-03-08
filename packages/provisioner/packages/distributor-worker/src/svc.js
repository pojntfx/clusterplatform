import Distributor from "./lib";
import * as shell from "async-shelljs";
import uuidv1 from "uuid/v4";
import { fs } from "@clusterplatform/builder-utils";

export default {
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
              artifactId: process.env.CLUSTERPLATFORM_DISTRIBUTOR_ARTIFACTID
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
        this.logger.warning &&
          (await this.logger.warning(
            "Distributor-worker can't connect to distributor-manager. Retrying every 2 seconds ..."
          ));
        await sleep(2000);
      }
    }
  },
  actions: {
    update: {
      params: {
        artifactId: "number",
        ipxePxeUefiUrl: "string",
        ipxePxeBiosUrl: "string",
        device: "string",
        range: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          `Updating distributor with data ${JSON.stringify({
            ...ctx.params
          })}`
        );
        const distributor = new Distributor({
          ...ctx.params,
          downloaddir: "/tmp/clusterplatform/app/distributor/downloaddir",
          builddir: `/tmp/clusterplatform/app/distributor/builddir`,
          packagedir: `/tmp/clusterplatform/app/distributor/packagedir`,
          configurationdir: `/tmp/clusterplatform/app/distributor/configurationdir`
        });
        await distributor.download(ctx.params);
        await distributor.build();
        await distributor.package();
        await distributor.configureNetwork();
        await distributor.configureDnsmasq(ctx.params.range);
        await this.logger.info(`Configured distributor!`);
        return await distributor.getScript();
      }
    },
    updateStatus: {
      params: {
        artifactId: { type: "number", convert: true },
        on: "boolean"
      },
      handler: async function(ctx) {
        const distributor = new Distributor({
          ...ctx.params,
          downloaddir: "/tmp/clusterplatform/app/distributor/downloaddir",
          builddir: `/tmp/clusterplatform/app/distributor/builddir`,
          packagedir: `/tmp/clusterplatform/app/distributor/packagedir`,
          configurationdir: `/tmp/clusterplatform/app/distributor/configurationdir`
        });
        if (ctx.params.on) {
          return await distributor.start(
            `dnsmasq-distributor-pxeboot-${ctx.params.artifactId}`
          );
        } else {
          return await distributor.stop(
            `dnsmasq-distributor-pxeboot-${ctx.params.artifactId}`
          );
        }
      }
    },
    pingNode: {
      params: {
        nodeIp: "string"
      },
      handler: async function(ctx) {
        return (await shell.exec(
          `ping -w 1 ${ctx.params.nodeIp} -c 1`
        )).stdout.includes("1 received")
          ? true
          : false;
      }
    },
    runScriptOnNode: {
      params: {
        nodeIp: "string",
        script: "string",
        privateKey: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          `Running script ${ctx.params.script} on node ${ctx.params.nodeIp}`
        );
        const artifactId = uuidv1();
        await shell.mkdir("-p", `${process.env.HOME}/.ssh`);
        const key = `${process.env.HOME}/.ssh/id_provisioner-${artifactId}`;
        await fs.writeFileSync(key, ctx.params.privateKey);
        await shell.chmod(700, key);
        return await shell.exec(`ssh -i "${key}" \
        -o "PasswordAuthentication no" \
        -o "StrictHostKeyChecking no" \
        root@${ctx.params.nodeIp} "${ctx.params.script}"`);
      }
    }
  }
};
