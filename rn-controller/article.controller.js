/*
 * 文章控制器
 */

const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');
const config = require('../app.config');

var TurndownService = require('turndown');

var turndownService = new TurndownService();

const UserCollection = require('../rn-model/user.collection.model');
const Article = require('../rn-model/article.model');
const Category = require('../rn-model/article.category.model');

const articleCtrl = {
  app: {},
  admin: {},
  common: {}
};

let successCount = 0, errorCount = 0; existCount = 0, requstCount = 0;

const appQuerys = {
  status: 1,
  public: 1
}


/**
 * 分页查询函数
 * @param {*查询条件} querys 
 * @param {*分页配置} options 
 * @param {*http请求返回体} res 
 * @param {*成功提示} successMsg 
 * @param {*错误提示} errMsg 
 */
const Paginate = (querys, options, res, successMsg = '操作成功', errMsg = '操作失败') => {
  Article.paginate(querys, options)
    .then(articles => {
      handleSuccess({
        res,
        message: successMsg,
        data: {
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
      handleError({ res, err, message: errMsg });
    })
};

// 客户端分页获取文章列表
articleCtrl.app.query = new Controller({
  method: 'GET',
  callback: ({ query: { page, per_page } }, res) => {

    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(page || 1),
      limit: Number(per_page || 10),
      populate: ['category'],
    };

    // 查询参数,默认查询已发布、公开文章
    let querys = { ...appQuerys };

    Paginate(querys, options, res, '文章列表获取成功！', '文章列表获取失败！');
  }
});

// 客户端根据文章类别ID分页查询
articleCtrl.app.queryByCategoryId = new Controller({
  method: 'GET',
  callback: ({ params: { category_code }, query: { page, per_page } }, res) => {

    let fetchCategoryId = function (category_code) {
      return new Promise((resolve, reject) => {
        Category.findOne({ code: category_code })
          .then(category => {
            resolve(category);
          }).catch(err => {
            reject(err);
          })
      })
    };


    let fetchArticleByCategoryId = function (category_id) {
      return new Promise((resolve, reject) => {
        // 过滤条件
        const options = {
          sort: { _id: -1 },
          page: Number(page || 1),
          limit: Number(per_page || 10),
          populate: ['category'],
        };

        // 查询参数,默认查询已发布、公开文章
        let querys = { ...appQuerys, category: category_id };

        Article.paginate(querys, options)
          .then(articles => {
            resolve(articles);
          })
          .catch(err => {
            reject(err);
          })
      })
    }

    let fetchData = async function (category_code) {
      let category = await fetchCategoryId(category_code);
      let articles = await fetchArticleByCategoryId(category._id);
      return articles;
    }

    fetchData(category_code)
      .then(result => {
        handleSuccess({
          res,
          message: '文章获取成功',
          data: {
            pagination: {
              total: result.total,
              current_page: result.page,
              total_page: result.pages,
              per_page: result.limit
            },
            data: result.docs
          }
        })
      })
      .catch(err => {
        handleError({ err, message: '获取文章失败！' })
      })
  }
});

// 客户端根据用户收藏分页查询
articleCtrl.app.queryByUserCollection = new Controller({
  method: 'GET',
  callback: ({ params: { user } }, res) => {

    UserCollection.findOne({ user }).populate('articles')
      .then(data => {
        handleSuccess({ res, message: '文章获取成功', data });
      })
      .catch(err => handleError({ res, message: '文章获取失败', err }))
  }
});


// app-根据ID获取单个文章
articleCtrl.app.querySingle = new Controller({
  method: 'GET',
  callback: ({ params: { article_id } }, res) => {

    let querys = { _id: article_id };

    Article.findOne(querys).populate('category tag')
      .then(data => {
        // 每请求一次，浏览次数都要增加
        data.meta.views += 1;
        data.save();

        let result = { ...data._doc };
        // console.log(result);
        result.content = turndownService.turndown(data.content);
        // console.log(result)
        handleSuccess({ res, message: '文章获取成功', data: result });
      })
      .catch(err => handleError({ res, message: '文章获取失败', err }))
  }
});

// admin-根据ID获取单个文章
articleCtrl.admin.querySingle = new Controller({
  method: 'GET',
  callback: ({ params: { article_id } }, res) => {
    let querys = { _id: article_id };

    Article.findOne(querys)
      .then(data => {
        // 每请求一次，浏览次数都要增加
        // data.meta.views += 1;
        // data.save();
        // data.content = turndownService.turndown(data.content);
        handleSuccess({ res, message: '文章获取成功', data });
      })
      .catch(err => handleError({ res, message: '文章获取失败', err }))
  }
});


// admin分页组合查询文章
articleCtrl.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(body.page || 1),
      limit: Number(body.per_page || 10),
      populate: ['category'],
    };
    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'page' && key != 'per_page') {
        querys[key] = body[key];
      }
    }

    Paginate(querys, options, res, '文章列表获取成功！', '文章列表获取失败！');
  }
});

// admin发布文章
articleCtrl.admin.publish = new Controller({
  method: 'POST',
  callback: ({ body: article }, res) => {
    // 验证
    if (!article.title || !article.content) {
      handleError({ res, message: '内容不合法' });
      return false;
    }
    // 保存文章
    const saveArticle = () => {
      new Article(article).save()
        .then((result = article) => {
          handleSuccess({ res, result, message: '文章发布成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '文章发布失败' });
        })
    }

    // 验证article合法性
    const title = article.title;
    const find = Article.find({ title });
    const promise = find.exec();
    promise.then(articles => {
      if (articles.length) {
        handleError({ res, message: "文章已存在！" });
      } else saveArticle();
    })
      .catch(err => {
        handleError({ res, err, message: '保存失败！' })
      })
  }
});

// 修改文章状态（移回收站、回收站恢复）
articleCtrl.admin.changeStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { id, status } }, res) => {
    // 验证
    if (!id) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    Article.update({ 'id': { $in: id } }, { $set: { status } }, { multi: true })
      .then(data => {
        handleSuccess({ res, data, message: '操作成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '操作失败' });
      })
  }
})


// 修改单个文章
articleCtrl.admin.update = new Controller({
  method: 'PUT',
  callback: ({ params: { article_id }, body: article }, res) => {

    // 验证
    if (!article.title || !article.content) {
      handleError({ res, message: '内容不合法' });
      return false;
    };

    // 修正信息
    // delete article.meta
    // delete article.create_at
    // delete article.update_at

    // 修改文章
    Article.findByIdAndUpdate(article_id, article, { new: true })
      .then(result => {
        handleSuccess({ res, result, message: '文章修改成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '文章修改失败' });
      })
  }
})


// export
exports.app = (({ app }) => {
  let res = {};
  for (let key of Object.keys(app)) {
    res[key] = (req, res) => handleRequest({ req, res, controller: app[key] })
  }
  return res;
})(articleCtrl);

exports.admin = (({ admin }) => {
  let res = {};
  for (let key of Object.keys(admin)) {
    res[key] = (req, res) => handleRequest({ req, res, controller: admin[key] })
  }
  return res;
})(articleCtrl);