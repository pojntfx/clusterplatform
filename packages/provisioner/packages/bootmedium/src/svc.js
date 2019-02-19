const Db = require("moleculer-db");
const Adapter = require("moleculer-db-adapter-sequelize");
const Orm = require("sequelize");

module.exports = {
  name: "bootmedium",
  actions: {
    createOverwrite: {
      params: {
        script: "string",
        label: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          "Queueing bootmedium subartifacts creation",
          ctx.params
        );
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
            architecture: "x86",
            extension: "efi",
            fragment: "img"
          }
        );
        const { id: grubEfiId } = await ctx.call(
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
        const bootmedium = await ctx.call("bootmedium.create", {
          ...ctx.params,
          ipxeUefiId,
          ipxeBiosId,
          grubImgId,
          grubEfiId,
          ldLinuxId,
          isolinuxBinId,
          isohdpfxBinId,
          isoId: 0
        });
        return bootmedium;
      }
    }
  },
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "bootmedium",
    define: {
      script: Orm.STRING,
      label: Orm.STRING,
      ipxeUefiId: Orm.INTEGER,
      ipxeBiosId: Orm.INTEGER,
      grubImgId: Orm.INTEGER,
      grubEfiId: Orm.INTEGER,
      ldLinuxId: Orm.INTEGER,
      isolinuxBinId: Orm.INTEGER,
      isohdpfxBinId: Orm.INTEGER,
      isoId: Orm.INTEGER
    }
  },
  settings: {
    entityValidator: {
      script: "string",
      label: "string",
      ipxeUefiId: "number",
      ipxeBiosId: "number",
      grubImgId: "number",
      grubEfiId: "number",
      ldLinuxId: "number",
      isolinuxBinId: "number",
      isohdpfxBinId: "number",
      isoId: "number"
    }
  }
};
