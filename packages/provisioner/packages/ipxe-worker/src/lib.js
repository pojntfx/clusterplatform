module.exports = class {
  constructor({ downloaddir, workdir }) {
    this.downloaddir = downloaddir;
    this.workdir = workdir;
  }

  async download() {}

  async build() {}

  async package() {}

  async upload() {}
};
