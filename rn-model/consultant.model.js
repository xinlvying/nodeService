/*
* 咨询师数据模型
*/

const mongoose = require('../rn-core/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

// 咨询师集合模型
const consultantSchema = new mongoose.Schema({

  // 咨询师名称
  name: { type: String, required: true, validate: /\S+/ },

  // 性别
  gender: { type: String, required: true },

  // 照片
  photo: { type: String },

  // 咨询方向
  field: { type: String },

  // 联系方式
  tel: { type: String, required: true },

  // 值班时间
  onduty_time: [String],

  // 值班星期
  onduty_day: String,

  // 咨询师简介
  description: String,

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date, default: Date.now },

  // 自定义扩展
  extends: [{
    name: { type: String, validate: /\S+/ },
    value: { type: String, validate: /\S+/ }
  }]
});

consultantSchema.set('toObject', { getters: true });

// 翻页 + 自增ID插件配置
consultantSchema.plugin(mongoosePaginate);
consultantSchema.plugin(autoIncrement.plugin, {
  model: 'Consultant',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
consultantSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

// 咨询师模型
const Consultant = mongoose.model('Consultant', consultantSchema);

// export
module.exports = Consultant;