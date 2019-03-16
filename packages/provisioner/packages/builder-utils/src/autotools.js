import * as shell from "async-shelljs";

export default class {
  static async autogen(path) {
    return await shell.exec(`${path ? path : "."}/autogen.sh`);
  }
  static async configure({ path, prefix, args }) {
    return await shell.exec(
      `${path ? path : "."}/configure --prefix=${prefix}${
        args ? " " + args : ""
      }`
    );
  }
  static async make(target, args) {
    return await shell.exec(
      `make${args && ` ${args}`}${target && ` ${target}`}`
    );
  }
  static async makeInstall() {
    return await shell.exec("make install");
  }
}
