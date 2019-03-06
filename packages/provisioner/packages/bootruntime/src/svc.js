import Db from "moleculer-db";
import Adapter from "moleculer-db-adapter-sequelize";
import Orm from "sequelize";
import { Errors } from "moleculer";

export default {
  name: "bootruntime",
  actions: {
    createOverwrite: {
      params: {
        script: "string",
        label: "string",
        isoArtifacts: "boolean",
        pxeArtifacts: "boolean"
      },
      handler: async function(ctx) {
        await this.logger.info(
          "Queueing boot runtime subartifacts creation",
          ctx.params
        );
        if (ctx.params.isoArtifacts) {
          const bootruntimeIsoArtifacts = await ctx.call(
            "bootruntime.createIsoArtifacts",
            {
              script: ctx.params.script,
              label: ctx.params.label
            }
          );
          if (!ctx.params.pxeArtifacts) {
            return await ctx.call("bootruntime.create", {
              ...ctx.params,
              ...bootruntimeIsoArtifacts,
              ipxePxeUefiId: 0,
              ipxePxeBiosId: 0,
              isoId: 0,
              distributorTags: [""]
            });
          } else {
            const bootruntimePxeArtifacts = await ctx.call(
              "bootruntime.createPxeArtifacts",
              {
                script: ctx.params.script
              }
            );
            return await ctx.call("bootruntime.create", {
              ...ctx.params,
              ...bootruntimeIsoArtifacts,
              ...bootruntimePxeArtifacts,
              isoId: 0,
              distributorTags: [""]
            });
          }
        }
        if (ctx.params.pxeArtifacts) {
          const bootruntimePxeArtifacts = await ctx.call(
            "bootruntime.createPxeArtifacts",
            {
              script: ctx.params.script
            }
          );
          if (!ctx.params.isoArtifacts) {
            return await ctx.call("bootruntime.create", {
              ...ctx.params,
              ...bootruntimePxeArtifacts,
              ipxeUefiId: 0,
              ipxeBiosId: 0,
              grubImgId: 0,
              grubEfiX64Id: 0,
              grubEfiX86Id: 0,
              ldLinuxId: 0,
              isolinuxBinId: 0,
              isohdpfxBinId: 0,
              isoId: 0,
              distributorTags: [""]
            });
          } else {
            const bootruntimeIsoArtifacts = await ctx.call(
              "bootruntime.createIsoArtifacts",
              {
                script: ctx.params.script,
                label: ctx.params.label
              }
            );
            return await ctx.call("bootruntime.create", {
              ...ctx.params,
              ...bootruntimePxeArtifacts,
              ...bootruntimeIsoArtifacts,
              isoId: 0,
              distributorTags: [""]
            });
          }
        }
        if (!ctx.params.isoArtifacts && !ctx.params.pxeArtifacts) {
          return await ctx.call("bootruntime.create", {
            ...ctx.params,
            ipxeUefiId: 0,
            ipxeBiosId: 0,
            grubImgId: 0,
            grubEfiX64Id: 0,
            grubEfiX86Id: 0,
            ldLinuxId: 0,
            isolinuxBinId: 0,
            isohdpfxBinId: 0,
            ipxePxeUefiId: 0,
            ipxePxeBiosId: 0,
            isoId: 0,
            distributorTags: [""]
          });
        }
      }
    },
    createIso: {
      params: {
        id: { type: "number", convert: true }
      },
      handler: async function(ctx) {
        await this.logger.info(
          "Queueing boot runtime iso subartifact creation",
          ctx.params
        );
        const {
          label,
          ipxeUefiId,
          ipxeBiosId,
          grubImgId,
          grubEfiX64Id,
          grubEfiX86Id,
          ldLinuxId,
          isolinuxBinId,
          isohdpfxBinId,
          isoArtifacts
        } = await ctx.call("bootruntime.get", { id: ctx.params.id });
        if (!isoArtifacts) {
          throw new Errors.MoleculerError(
            "ISO Artifacts have not been created for this boot runtime",
            422,
            "ERR_ISO_ARTIFACTS_NOT_CREATED"
          );
        } else {
          const { artifactId: ipxeUefiArtifactId } = await ctx.call(
            "ipxe-manager.get",
            {
              id: ipxeUefiId
            }
          );
          const { artifactId: ipxeBiosArtifactId } = await ctx.call(
            "ipxe-manager.get",
            {
              id: ipxeBiosId
            }
          );
          const { artifactId: grubImgArtifactId } = await ctx.call(
            "grub-manager.get",
            {
              id: grubImgId
            }
          );
          const { artifactId: grubEfiX64ArtifactId } = await ctx.call(
            "grub-manager.get",
            {
              id: grubEfiX64Id
            }
          );
          const { artifactId: grubEfiX86ArtifactId } = await ctx.call(
            "grub-manager.get",
            {
              id: grubEfiX86Id
            }
          );
          const { artifactId: ldLinuxArtifactId } = await ctx.call(
            "syslinux-manager.get",
            {
              id: ldLinuxId
            }
          );
          const { artifactId: isolinuxBinArtifactId } = await ctx.call(
            "syslinux-manager.get",
            {
              id: isolinuxBinId
            }
          );
          const { artifactId: isohdpfxBinArtifactId } = await ctx.call(
            "syslinux-manager.get",
            {
              id: isohdpfxBinId
            }
          );
          const { id: isoId } = await ctx.call("iso-manager.createOverwrite", {
            label,
            ipxeUefiUrl: `http://minio:9000/ipxes/${ipxeUefiArtifactId}/ipxe.efi`,
            ipxeBiosUrl: `http://minio:9000/ipxes/${ipxeBiosArtifactId}/ipxe.lkrn`,
            grubImgUrl: `http://minio:9000/grubs/${grubImgArtifactId}/grub.img`,
            grubEfiX64Url: `http://minio:9000/grubs/${grubEfiX64ArtifactId}/grub.zip`,
            grubEfiX86Url: `http://minio:9000/grubs/${grubEfiX86ArtifactId}/grub.zip`,
            ldLinuxUrl: `http://minio:9000/syslinuxs/${ldLinuxArtifactId}/ldlinux.c32`,
            isolinuxBinUrl: `http://minio:9000/syslinuxs/${isolinuxBinArtifactId}/isolinux.bin`,
            isohdpfxBinUrl: `http://minio:9000/syslinuxs/${isohdpfxBinArtifactId}/isohdpfx.bin`
          });
          return await ctx.call("bootruntime.update", {
            id: ctx.params.id,
            isoId
          });
        }
      }
    },
    createIsoArtifacts: {
      params: {
        script: "string",
        label: "string"
      },
      handler: async function(ctx) {
        const { id: ipxeUefiId } = await ctx.call(
          "ipxe-manager.createOverwrite",
          {
            script: ctx.params.script,
            platform: "bin-x86_64-efi",
            driver: "ipxe",
            extension: "efi"
          }
        );
        const { id: ipxeBiosId } = await ctx.call(
          "ipxe-manager.createOverwrite",
          {
            script: ctx.params.script,
            platform: "bin",
            driver: "ipxe",
            extension: "lkrn"
          }
        );
        const { id: grubImgId } = await ctx.call(
          "grub-manager.createOverwrite",
          {
            label: ctx.params.label,
            platform: "x86_64-efi",
            architecture: "x64",
            extension: "efi",
            fragment: "img"
          }
        );
        const { id: grubEfiX64Id } = await ctx.call(
          "grub-manager.createOverwrite",
          {
            label: ctx.params.label,
            platform: "x86_64-efi",
            architecture: "x64",
            extension: "efi",
            fragment: "efi"
          }
        );
        const { id: grubEfiX86Id } = await ctx.call(
          "grub-manager.createOverwrite",
          {
            label: ctx.params.label,
            platform: "x86_64-efi",
            architecture: "x86",
            extension: "efi",
            fragment: "efi"
          }
        );
        const { id: ldLinuxId } = await ctx.call(
          "syslinux-manager.createOverwrite",
          {
            fragment: "ldlinux.c32"
          }
        );
        const { id: isolinuxBinId } = await ctx.call(
          "syslinux-manager.createOverwrite",
          {
            fragment: "isolinux.bin"
          }
        );
        const { id: isohdpfxBinId } = await ctx.call(
          "syslinux-manager.createOverwrite",
          {
            fragment: "isohdpfx.bin"
          }
        );
        return {
          ipxeUefiId,
          ipxeBiosId,
          grubImgId,
          grubEfiX64Id,
          grubEfiX86Id,
          ldLinuxId,
          isolinuxBinId,
          isohdpfxBinId
        };
      }
    },
    createPxe: {
      params: {
        id: { type: "number", convert: true },
        distributorTags: "array",
        device: "string",
        range: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          "Queueing boot runtime pxe subartifact application",
          ctx.params
        );
        const { ipxePxeUefiId, ipxePxeBiosId, pxeArtifacts } = await ctx.call(
          "bootruntime.get",
          { id: ctx.params.id }
        );
        if (!pxeArtifacts) {
          throw new Errors.MoleculerError(
            "PXE Artifacts have not been created for this boot runtime",
            422,
            "ERR_PXE_ARTIFACTS_NOT_CREATED"
          );
        } else {
          for (let distributorTag of ctx.params.distributorTags) {
            const distributors = await ctx.call("distributor-manager.find", {
              query: { artifactId: distributorTag }
            });
            for (let distributor of distributors) {
              const { artifactId: ipxePxeUefiArtifactId } = await ctx.call(
                "ipxe-manager.get",
                {
                  id: ipxePxeUefiId
                }
              );
              const { artifactId: ipxePxeBiosArtifactId } = await ctx.call(
                "ipxe-manager.get",
                {
                  id: ipxePxeBiosId
                }
              );
              await ctx.call("distributor-manager.updateDistributor", {
                ...ctx.params,
                id: distributor.id,
                artifactId: parseInt(ctx.params.id),
                ipxePxeUefiUrl: `http://${process.env.MINIO_ENDPOINT}:${
                  process.env.MINIO_PORT
                }/ipxes/${ipxePxeUefiArtifactId}/ipxe.efi`,
                ipxePxeBiosUrl: `http://${process.env.MINIO_ENDPOINT}:${
                  process.env.MINIO_PORT
                }/ipxes/${ipxePxeBiosArtifactId}/ipxe.kpxe`
              });
            }
          }
          return await ctx.call("bootruntime.update", {
            id: ctx.params.id,
            distributorTags: ctx.params.distributorTags
          });
        }
      }
    },
    createPxeArtifacts: {
      params: {
        script: "string"
      },
      handler: async function(ctx) {
        const { id: ipxePxeUefiId } = await ctx.call(
          "ipxe-manager.createOverwrite",
          {
            script: ctx.params.script,
            platform: "bin-x86_64-efi",
            driver: "ipxe",
            extension: "efi"
          }
        );
        const { id: ipxePxeBiosId } = await ctx.call(
          "ipxe-manager.createOverwrite",
          {
            script: ctx.params.script,
            platform: "bin-x86_64-pcbios",
            driver: "ipxe",
            extension: "kpxe"
          }
        );
        return {
          ipxePxeUefiId,
          ipxePxeBiosId
        };
      }
    },
    updateDistributorStatus: {
      params: {
        id: { type: "number", convert: true },
        on: "boolean"
      },
      handler: async function(ctx) {
        const bootruntime = await ctx.call("bootruntime.get", {
          id: ctx.params.id
        });
        for (let distributorTag of bootruntime.distributorTags) {
          const distributors = await ctx.call("distributor-manager.find", {
            query: { artifactId: distributorTag }
          });
          for (let distributor of distributors) {
            await ctx.call("distributor-manager.updateDistributorStatus", {
              id: distributor.id,
              artifactId: parseInt(bootruntime.id),
              on: ctx.params.on
            });
          }
        }
        return await ctx.call("bootruntime.get", {
          id: ctx.params.id
        });
      }
    }
  },
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "bootruntime",
    define: {
      script: Orm.TEXT,
      label: Orm.STRING,
      ipxeUefiId: Orm.INTEGER,
      ipxeBiosId: Orm.INTEGER,
      grubImgId: Orm.INTEGER,
      grubEfiX64Id: Orm.INTEGER,
      grubEfiX86Id: Orm.INTEGER,
      ldLinuxId: Orm.INTEGER,
      isolinuxBinId: Orm.INTEGER,
      isohdpfxBinId: Orm.INTEGER,
      ipxePxeUefiId: Orm.INTEGER,
      ipxePxeBiosId: Orm.INTEGER,
      isoId: Orm.INTEGER,
      distributorTags: Orm.ARRAY(Orm.STRING),
      isoArtifacts: Orm.BOOLEAN,
      pxeArtifacts: Orm.BOOLEAN
    }
  },
  settings: {
    entityValidator: {
      script: "string",
      label: "string",
      ipxeUefiId: "number",
      ipxeBiosId: "number",
      grubImgId: "number",
      grubEfiX64Id: "number",
      grubEfiX86Id: "number",
      ldLinuxId: "number",
      isolinuxBinId: "number",
      isohdpfxBinId: "number",
      ipxePxeUefiId: "number",
      ipxePxeBiosId: "number",
      isoId: "number",
      distributorTags: "array",
      isoArtifacts: "boolean",
      pxeArtifacts: "boolean"
    }
  }
};
