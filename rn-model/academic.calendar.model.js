/*
* 校历数据模型
*/

const mongoose = require('../rn-core/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

// 校历集合模型（开学日期-放假日期）
const academicCalendar = new mongoose.Schema({

  // 学期名称
  title: { type: String, required: true, validate: /\S+/ },

  // 学期开始时间
  begin_at: { type: Date, required: true },

  // 学期结束时间
  end_at: { type: Date, required: true },

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

academicCalendar.set('toObject', { getters: true });

// 翻页 + 自增ID插件配置
academicCalendar.plugin(mongoosePaginate);
academicCalendar.plugin(autoIncrement.plugin, {
  model: 'Calendar',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
academicCalendar.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

// 分类模型
const Calendar = mongoose.model('Calendar', academicCalendar);

// export
module.exports = Calendar;
