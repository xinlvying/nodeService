
/*
* 用户收藏模型
*/

const config = require('../app.config');
const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../rn-core/mongodb').mongoose;

// 自增ID初始化
autoIncrement.initialize(mongoose.connection);

const userCollection = new mongoose.Schema({

  // 用户id
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 收藏文章
  articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }],

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date, default: Date.now }

});

userCollection.set('toObject', { getters: true });

// 翻页 插件配置
userCollection.plugin(mongoosePaginate)
userCollection.plugin(autoIncrement.plugin, {
  model: 'UserCollection',
  field: 'id',
  startAt: 1,
  incrementBy: 1
});


// 时间更新
userCollection.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});


const UserCollection = mongoose.model('UserCollection', userCollection);
module.exports = UserCollection;