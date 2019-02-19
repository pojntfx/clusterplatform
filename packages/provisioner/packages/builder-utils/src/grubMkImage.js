const shell = require("async-shelljs");

module.exports = class {
  static async makeImage({
    pathToBinary,
    platform,
    root,
    architecture,
    configFile
  }) {
    return await shell.exec(
      `"${pathToBinary}" -O "${platform}" -o "${root}/EFI/BOOT/boot${architecture}.efi" -p "" --config "${configFile}" part_gpt part_msdos ntfs ntfscomp hfsplus fat ext2 normal chain boot configfile linux multiboot iso9660 gfxmenu gfxterm loadenv efi_gop efi_uga loadbios fixvideo png ext2 ntfscomp loopback search minicmd cat cpuid appleldr elf usb videotest halt help ls reboot echo test normal sleep memdisk tar font video_fb video gettext true  video_bochs video_cirrus multiboot2 acpi gfxterm_background gfxterm_menu linux16`
    );
  }
};
