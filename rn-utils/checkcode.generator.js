/**
 * 验证码生成
 */

exports.generateCheckCode = length => {
  const base = 'azxcvbnmsdfghjklqwertyuiopZXCVBNMASDFGHJKLQWERTYUIOP0123456789';
  let code = "";
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * 62);
    code += all.charAt(index);
  }
  return code;
}