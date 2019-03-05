import * as shell from "async-shelljs";

export default class {
  static async createArchive(src, dest) {
    return await shell.exec(`zip -r ${dest} ${src}`);
  }
  static async extractArchive(src, dest) {
    return await shell.exec(`unzip -d ${dest} ${src}`);
  }
}
