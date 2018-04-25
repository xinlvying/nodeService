/*
* 咨询记录数据模型
*/

const mongoose = require('../rn-core/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

// 咨询记录集合模型
const consultRecordSchema = new mongoose.Schema({

  // 咨询师名称
  consultant_name: { type: String, required: true, validate: /\S+/ },

  // 来访人电话
  visitor_tel: { type: String, required: true, validate: /\S+/ },

  // 来访人性别
  visitor_gender: String,

  // 咨询方向
  field: String,

  // 咨询时间
  consult_time: { type: Date, required: true },

  // 记录状态 => // 1未确认，2已确认，3已咨询，4已取消，5已更改咨询时间
  status: { type: Number, required: true, default: 1 },

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date },

  // 备注
  remark: String,

  // 自定义扩展
  extends: [{
    name: { type: String, validate: /\S+/ },
    value: { type: String, validate: /\S+/ }
  }]
});

consultRecordSchema.set('toObject', { getters: true });

// 翻页 + 自增ID插件配置
consultRecordSchema.plugin(mongoosePaginate);
consultRecordSchema.plugin(autoIncrement.plugin, {
  model: 'Category',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
consultRecordSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

// 分类模型
const Consultant = mongoose.model('Consultant', consultRecordSchema);

// export
module.exports = Consultant;