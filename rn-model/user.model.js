/*
* 权限和用户数据模型
*/

const config = require('../app.config');

const mongoose = require('../rn-core/mongodb').mongoose;
const userSchema = new mongoose.Schema({

  // 用户名
  username: { type: String, default: '' },

  // 手机号
  phone: { type: String, default: '' },

  // 年级
  grade: { type: String, default: '' },

  // 学院
  college: { type: String, default: '' },

  // 签名
  slogan: { type: String, default: '' },

  // 头像
  gravatar: { type: String, default: '' },

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date },
});

userSchema.set('toObject', { getters: true });

// 时间更新
userSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;