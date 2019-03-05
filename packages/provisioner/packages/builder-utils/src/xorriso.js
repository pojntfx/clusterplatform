import * as shell from "async-shelljs";

export default class {
  static async createBootableIso({
    src,
    isohdpfxBinPath,
    bootCatPath,
    isolinuxBinPath,
    grubImgPath,
    label,
    dest
  }) {
    return shell.exec(`xorriso \
    -as mkisofs \
    -isohybrid-mbr "${isohdpfxBinPath}" \
    -r \
    -partition_offset 16 -J -l -joliet-long \
    -c "${bootCatPath}" \
    -b "${isolinuxBinPath}" \
    -no-emul-boot \
    -boot-info-table \
    -boot-load-size 4 \
    -eltorito-alt-boot \
    -e "${grubImgPath}" \
    -no-emul-boot \
    -isohybrid-gpt-basdat \
    -V "${label}" \
    -o "${dest}" "${src}"
  `);
  }
}
