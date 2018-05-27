/*
* 匿名问题模型
*/

const config = require('../app.config');
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../rn-core/mongodb').mongoose;

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

const questionSchema = new mongoose.Schema({

  // 问题标题
  title: { type: String, required: true, validate: /\S+/ },

  // 问题内容
  content: { type: String, required: true, validate: /\S+/ },

  // 问题状态 => 0：未审核；1：已审核通过；2：已审核，未通过
  status: { type: Number, default: 0 },

  // 问题回答
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date, default: Date.now }
});

questionSchema.set('toObject', { getters: true });

// 翻页 插件配置
questionSchema.plugin(mongoosePaginate)
questionSchema.plugin(autoIncrement.plugin, {
  model: 'Question',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

// 时间更新
questionSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});


const Question = mongoose.model('Question', questionSchema);
module.exports = Question;