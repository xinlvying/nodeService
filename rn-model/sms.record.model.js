/*
* 短信记录模型
*/

const config = require('../app.config');
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../rn-core/mongodb').mongoose;
const smsSchema = new mongoose.Schema({

  // 手机号
  login_phone: { type: String, required: true, validate: /\S+/ },

  // 年级
  sms_code: { type: String, required: true },

  // 创建时间
  create_at: { type: Date, default: Date.now },

});

smsSchema.set('toObject', { getters: true });

// 翻页 插件配置
smsSchema.plugin(mongoosePaginate)
smsSchema.plugin(autoIncrement.plugin, {
  model: 'Sms',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

const Sms = mongoose.model('Sms', smsSchema);
module.exports = Sms;