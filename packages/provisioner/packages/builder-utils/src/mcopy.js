import shell from "shelljs";

export default class {
  static async mcopy({ src, dest }) {
    return shell.exec(`mcopy -s -i ${dest} ${src} ::`);
  }
}
