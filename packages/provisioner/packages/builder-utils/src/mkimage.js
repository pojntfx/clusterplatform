import * as shell from "async-shelljs";

export default class {
  static async mkimage({ platform, src, dest }) {
    return shell.exec(
      `mkimage -C none -A ${platform} -T script -d ${src} ${dest}`
    );
  }
}
