
/*
* 用户推荐模型
*/

const config = require('../app.config');
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../rn-core/mongodb').mongoose;

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

const userRecommend = new mongoose.Schema({

  // 用户id
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 推荐文章
  article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }],

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date, default: Date.now }

});

userRecommend.set('toObject', { getters: true });

// 翻页 插件配置
userRecommend.plugin(mongoosePaginate)
userRecommend.plugin(autoIncrement.plugin, {
  model: 'UserRecommend',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});


// 时间更新
userRecommend.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});


const UserRecommend = mongoose.model('UserRecommend', userRecommend);
module.exports = UserRecommend;