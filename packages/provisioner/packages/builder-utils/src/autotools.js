const shell = require("async-shelljs");

module.exports = class {
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
    return await shell.exec(`make${target && ` ${target}`}${args && ` ${args}`}`);
  }
  static async makeInstall() {
    return await shell.exec("make install");
  }
};
