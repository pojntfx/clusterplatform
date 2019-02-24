const shell = require("async-shelljs");

module.exports = class {
  static async getAllInterfaces() {
    return shell.exec("ip a");
  }
  static async addIpAddressToInterface(ip, device) {
    return shell.exec(`ip addr add ${ip} dev ${device}`);
  }
  static async setInterfaceStatus(status, device) {
    return shell.exec(`ip link set ${device} ${status}`);
  }
};
