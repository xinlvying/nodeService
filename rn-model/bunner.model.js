/**
 * 资源位模型
 */

const autoIncrement = require('mongoose-auto-increment-fix');
const mongoosePaginate = require('mongoose-paginate');

const { handleSuccess, handleRequest, handleError } = require('../rn-utils/handler');

const Article = require('../rn-model/article.model');

const mongoose = require('../rn-core/mongodb').mongoose;

const bannerSchema = new mongoose.Schema({

  // 标题
  title: { type: String, required: true, unique: true },

  // banner位置 => 1: 轮播，2：推荐位
  position: { type: Number, required: true },

  // banner链接
  img_url: { type: String, required: true },

  // banner类型 => 1：文章，2：页面
  category: { type: Number, required: true, default: 1 },

  // 文章ID
  article_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },

  // 页面链接
  link: String,

  // 排序
  // rank: { type: Number, required: true },

  // 状态 => 0：停用，1：启用
  status: { type: Number, default: 1 },

  // 创建时间
  create_at: { type: Date, default: Date.now },

  // 其他元信息
  meta: {
    clicks: { type: Number, default: 0 }
  },

  // 自定义扩展
  extends: [{
    name: { type: String, validate: /\S+/ },
    value: { type: String, validate: /\S+/ }
  }]
});

bannerSchema.set('toObject', { getters: true });

// 翻页 + 自增ID插件配置
bannerSchema.plugin(mongoosePaginate);
bannerSchema.plugin(autoIncrement.plugin, {
  model: 'BannerSchema',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// 时间更新
bannerSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() });
  next();
});


const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;