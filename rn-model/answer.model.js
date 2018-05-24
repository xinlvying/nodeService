/*
* 匿名回答模型
*/

const config = require('../app.config');
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../rn-core/mongodb').mongoose;

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

const answerSchema = new mongoose.Schema({

  // 问题id
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },

  // 回答内容
  content: { type: String, required: true, validate: /\S+/ },

  // 问题状态 => 0：未审核；1：已审核通过；2：已审核，未通过
  status: { type: Number, default: 0 },

  // 创建时间
  create_at: { type: Date, default: Date.now },

});

answerSchema.set('toObject', { getters: true });

// 翻页 插件配置
answerSchema.plugin(mongoosePaginate)
answerSchema.plugin(autoIncrement.plugin, {
  model: 'Answer',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;