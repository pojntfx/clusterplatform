const fs = require("fs");
const { promisify } = require("util");
const fsStat = promisify(fs.stat);

const access = async file =>
  new Promise((resolve, reject) =>
    fsStat(file)
      .then(stats => resolve(stats.isFile() || stats.isDirectory()))
      .catch(err => {
        if (err.code === "ENOENT") {
          resolve(false);
        } else {
          reject(err);
        }
      })
  );

module.exports = {
  ...fs,
  writeFile: promisify(fs.writeFile),
  exists: async path => await access(path)
};
