/**
 * 验证码生成
 */

module.exports = length => {
  const base = '0123456789';
  let code = "";
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * 10);
    code += base.charAt(index);
  }
  return code;
}