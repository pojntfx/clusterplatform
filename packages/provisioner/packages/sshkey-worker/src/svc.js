import * as shell from "async-shelljs";
import uuidv1 from "uuid/v4";

export default {
  name: "sshkey-worker",
  actions: {
    get: {
      params: {
        algorithm: "string"
      },
      handler: async function(ctx) {
        const artifactId = uuidv1();
        const builddir = `/tmp/clusterplatform/app/sshkey-worker/builddir/${artifactId}`;
        await shell.mkdir("-p", builddir);
        await shell.exec(
          `ssh-keygen -t ${ctx.params.algorithm} -N '' -f ${builddir}/id`
        );
        const publicKey = await shell.cat(`${builddir}/id.pub`);
        const privateKey = await shell.cat(`${builddir}/id`);
        await shell.rm("-rf", `${builddir}/*`);
        return {
          publicKey,
          privateKey
        };
      }
    }
  }
};
