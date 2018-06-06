/*
* 阅读记录数据模型
*/

const mongoose = require('../rn-core/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

// 咨询记录集合模型
const readingRecordSchema = new mongoose.Schema({

  // 阅读文章
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },

  // 读者
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 读者评分
  rating: Number,

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

readingRecordSchema.set('toObject', { getters: true });

// 翻页 + 自增ID插件配置
readingRecordSchema.plugin(mongoosePaginate);
readingRecordSchema.plugin(autoIncrement.plugin, {
  model: 'ReadingRecord',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
readingRecordSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});

// 咨询记录模型
const ReadingRecord = mongoose.model('ReadingRecord', readingRecordSchema);

// export
module.exports = ReadingRecord;