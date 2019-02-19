const shell = require("shelljs");

module.exports = class {
  static async mcopy({ src, dest }) {
    return shell.exec(`mcopy -s -i ${dest} ${src} ::`);
  }
};
