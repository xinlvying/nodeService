/**
 * 控制器构造函数
 */

module.exports = class Controller {
  constructor({ method, callback }) {
    this.method = method;
    this.callback = callback;
  }
}