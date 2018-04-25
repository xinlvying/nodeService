/*
 * 文章控制器
 */

const config = require('../app.config');

const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');

const Category = require('../rn-model/article.category.model');
const Article = require('../rn-model/article.model');

const articleCtrl = { list: {}, item: {} };

// 获取文章列表
articleCtrl.list.GET = (req, res) => {

  let { page, per_page, state, public, keyword, category, date } = req.query;

  // 过滤条件
  const options = {
    sort: { _id: -1 },
    page: Number(page || 1),
    limit: Number(per_page || 10),
    populate: ['category', 'tag'],
    // select: '-password -content'
  };

  // 查询参数
  let querys = {};

  // 按照state查询
  if (['0', '1', '-1'].includes(state)) {
    querys.state = state;
  };

  // 按照公开程度查询
  if (['0', '1', '-1'].includes(public)) {
    querys.public = public;
  };

  // 关键词查询
  if (keyword) {
    const keywordReg = new RegExp(keyword);
    querys['$or'] = [
      { 'title': keywordReg },
      { 'content': keywordReg },
      { 'description': keywordReg }
    ]
  };

  // 标签id查询
  if (tag) {
    querys.tag = tag;
  };

  // 分类id查询
  if (category) {
    querys.category = category;
  };

  // 时间查询
  if (date) {
    const getDate = new Date(date);
    if (!Object.is(getDate.toString(), 'Invalid Date')) {
      querys.create_at = {
        "$gte": new Date((getDate / 1000 - 60 * 60 * 8) * 1000),
        "$lt": new Date((getDate / 1000 + 60 * 60 * 16) * 1000)
      };
    }
  };

  // 如果是前台请求，则重置公开状态和发布状态
  if (!authIsVerified(req)) {
    querys.state = 1;
    querys.public = 1;
  };

  // 请求对应文章
  const getArticles = () => {
    Article.paginate(querys, options)
      .then(articles => {
        handleSuccess({
          res,
          message: '文章列表获取成功',
          result: {
            pagination: {
              total: articles.total,
              current_page: articles.page,
              total_page: articles.pages,
              per_page: articles.limit
            },
            data: articles.docs
          }
        })
      })
      .catch(err => {
        handleError({ res, err, message: '文章列表获取失败' });
      })
  };

  // 默认请求文章列表
  getArticles();
};

// 发布文章
articleCtrl.list.POST = ({ body: article }, res) => {
  // 验证
  if (!article.title || !article.content) {
    handleError({ res, message: '内容不合法' });
    return false;
  };

  // 保存文章
  new Article(article).save()
    .then((result = article) => {
      handleSuccess({ res, result, message: '文章发布成功' });
    })
    .catch(err => {
      handleError({ res, err, message: '文章发布失败' });
    })
};

// // 批量修改文章（移回收站、回收站恢复）
// articleCtrl.list.PATCH = ({ body: { articles, action } }, res) => {

//   // 验证
//   if (!articles || !articles.length) {
//     handleError({ res, message: '缺少有效参数' });
//     return false;
//   };

//   // 要改的数据
//   let updatePart = {};

//   switch (action) {
//     // 移至回收站
//     case 1:
//       updatePart.state = -1;
//       break;
//     // 移至草稿
//     case 2:
//       updatePart.state = 0;
//       break;
//     // 移至已发布
//     case 3:
//       updatePart.state = 1;
//       break;
//     default:
//       break;
//   };

//   Article.update({ '_id': { $in: articles } }, { $set: updatePart }, { multi: true })
//     .then(result => {
//       handleSuccess({ res, result, message: '文章批量操作成功' });
//       buildSiteMap();
//     })
//     .catch(err => {
//       handleError({ res, err, message: '文章批量操作失败' });
//     })
// };

// // 批量删除文章
// articleCtrl.list.DELETE = ({ body: { articles } }, res) => {

//   // 验证
//   if (!articles || !articles.length) {
//     handleError({ res, message: '缺少有效参数' });
//     return false;
//   };

//   // delete action
//   const deleteArticls = () => {
//     Article.remove({ '_id': { $in: articles } })
//       .then(result => {
//         handleSuccess({ res, result, message: '文章批量删除成功' });
//         buildSiteMap();
//       })
//       .catch(err => {
//         handleError({ res, err, message: '文章批量删除失败' });
//       })
//   };

//   // baidu-seo-delete
//   Article.find({ '_id': { $in: articles } }, 'id')
//     .then(articles => {
//       if (articles && articles.length) {
//         const urls = articles.map(article => `${config.INFO.site}/article/${article.id}`).join('\n');
//         baiduSeoDelete(urls);
//       }
//       deleteArticls();
//     })
//     .catch(err => {
//       deleteArticls();
//     })
// };

// 获取单个文章
// articleCtrl.item.GET = ({ params: { article_id } }, res) => {

//   // 判断来源
//   const isFindById = Object.is(Number(article_id), NaN);

//   // 获取相关文章
//   const getRelatedArticles = result => {
//     Article.find(
//       { state: 1, public: 1, tag: { $in: result.tag.map(t => t._id) } },
//       'id title description thumb -_id',
//       (err, articles) => {
//         result.related = err ? [] : articles;
//         handleSuccess({ res, result, message: '文章获取成功' });
//       })
//   };

//   (isFindById
//     ? Article.findById(article_id)
//     : Article.findOne({ id: article_id, state: 1, public: 1 }).populate('category tag').exec()
//   )
//     .then(result => {
//       // 每请求一次，浏览次数都要增加
//       if (!isFindById) {
//         result.meta.views += 1;
//         result.save();
//       }
//       if (!isFindById && result.tag.length) {
//         getRelatedArticles(result.toObject());
//       } else {
//         handleSuccess({ res, result, message: '文章获取成功' });
//       }
//     })
//     .catch(err => {
//       handleError({ res, err, code: 404, message: '文章获取失败' });
//     })
// };

// // 修改单个文章
// articleCtrl.item.PUT = ({ params: { article_id }, body: article }, res) => {

//   // 验证
//   if (!article.title || !article.content) {
//     handleError({ res, message: '内容不合法' });
//     return false;
//   };

//   // 修正信息
//   delete article.meta
//   delete article.create_at
//   delete article.update_at

//   // 修改文章
//   Article.findByIdAndUpdate(article_id, article, { new: true })
//     .then(result => {
//       handleSuccess({ res, result, message: '文章修改成功' });
//       buildSiteMap();
//       baiduSeoUpdate(`${config.INFO.site}/article/${result.id}`);
//     })
//     .catch(err => {
//       handleError({ res, err, message: '文章修改失败' });
//     })
// };

// // 删除单个文章
// articleCtrl.item.DELETE = ({ params: { article_id } }, res) => {
//   Article.findByIdAndRemove(article_id)
//     .then(result => {
//       handleSuccess({ res, result, message: '文章删除成功' });
//       buildSiteMap();
//       baiduSeoDelete(`${config.INFO.site}/article/${result.id}`);
//     })
//     .catch(err => {
//       handleError({ res, err, message: '文章删除失败' });
//     })
// };

// export
exports.list = (req, res) => { handleRequest({ req, res, controller: articleCtrl.list }) };
exports.item = (req, res) => { handleRequest({ req, res, controller: articleCtrl.item }) };