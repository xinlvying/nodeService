/*
* 权限和用户数据模型
*/

const config = require('../app.config');
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../rn-core/mongodb').mongoose;
const userSchema = new mongoose.Schema({

  // 用户名
  user_name: { type: String, default: '' },

  // 用户类型 => 0：普通用户,1：管理员
  user_type: { type: Number, default: 0 },

  // 用户状态 => 0：无效,1：有效
  user_status: { type: Number, default: 1 },

  // 手机号
  login_phone: { type: String, required: true, validate: /\S+/ },

  // 年级
  grade: { type: String, default: '' },

  // 阅读偏好
  preferences: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    scores: [Number]
  }],

  // 学院
  college: { type: String, default: '' },

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date },
});

userSchema.set('toObject', { getters: true });

// 翻页 插件配置
userSchema.plugin(mongoosePaginate)
userSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
userSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;