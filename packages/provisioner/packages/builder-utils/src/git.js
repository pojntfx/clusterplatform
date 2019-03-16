import * as shell from "async-shelljs";

export default class {
  static async cloneOrPullRepo(remote, dest, flags) {
    return (await shell.ls("-A", dest).find(file => file === ".git"))
      ? await shell.exec(
          `git --git-dir="${dest}/.git" --work-tree="${dest}" pull`
        )
      : await shell.exec(
          `git clone${flags && ` ${flags}`} ${remote} "${dest}"`
        );
  }
}
