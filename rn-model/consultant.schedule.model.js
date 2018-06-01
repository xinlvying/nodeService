/*
* 咨询师值班表数据模型
*/

const mongoose = require('../rn-core/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment-fix');

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

// 咨询师集合模型
const consultantScheduleSchema = new mongoose.Schema({
  // 值班周次
  week: { type: String, required: true },

  // 值班星期
  weekday: { type: String, required: true },

  // 值班时间
  time: { type: String, required: true },

  // 值班日期
  date: { type: Date, required: true },

  // 值班咨询师
  consutlant: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },

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

consultantScheduleSchema.set('toObject', { getters: true });

// 翻页 + 自增ID插件配置
consultantScheduleSchema.plugin(autoIncrement.plugin, {
  model: 'ConsultantSchedule',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
consultantScheduleSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

// 咨询师模型
const ConsultantSchedule = mongoose.model('ConsultantSchedule', consultantScheduleSchema);

// export
module.exports = ConsultantSchedule;