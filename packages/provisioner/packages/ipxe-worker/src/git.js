const shell = require("async-shelljs");

module.exports = class {
  static async cloneOrPullRepo(remote, dest) {
    return await shell.ls("-A", dest).find(file => file === ".git")
      ? await shell.exec(`git --git-dir="${dest}/.git" --work-tree="${dest}" pull`)
      : await shell.exec(`git clone ${remote} "${dest}"`);
  }
};
