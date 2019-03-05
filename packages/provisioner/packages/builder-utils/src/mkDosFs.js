import * as shell from "async-shelljs";

export default class {
  static async makeDosFilesystem({ label, dest, size }) {
    return shell.exec(
      `mkdosfs -F12 -n "${label
        .split(" ")
        .join("_")
        .toUpperCase()}_EFI" -C ${dest} ${size}`
    );
  }
}
