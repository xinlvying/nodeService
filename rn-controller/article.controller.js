/*
 * 文章控制器
 */

const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');
const config = require('../app.config');

var TurndownService = require('turndown');

var turndownService = new TurndownService()

// const Category = require('../rn-model/article.category.model');
const Article = require('../rn-model/article.model');

const articleCtrl = {
  app: {},
  admin: {},
  common: {}
};

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

/**
 * 
 * @param {*查询条件} querys 
 * @param {*返回字段筛选配置} option 
 * @param {*http返回体} res 
 * @param {*成功提示} successMsg 
 * @param {*失败提示} errMsg 
 */
const Find = (querys, option, res, successMsg = '操作成功', errMsg = '操作失败') => {
  Article.find(querys, option)
    .then(data => {
      console.log(data)
      handleSuccess({ res, message: '文章获取成功', data });
    })
    .catch(err => handleError({ res, message: '文章获取失败', err }))
}

// 客户端分页获取文章列表
articleCtrl.app.query = new Controller({
  method: 'GET',
  callback: ({ query: { page, per_page } }, res) => {
    // 过滤条件
    const options = {
      sort: { _id: -1 },
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
  callback: ({ params: { category_id }, query: { page, per_page } }, res) => {
    // 过滤条件
    const options = {
      sort: { _id: -1 },
      page: Number(page || 1),
      limit: Number(per_page || 10),
      populate: ['category'],
    };

    // 查询参数,默认查询已发布、公开文章
    let querys = { ...appQuerys, category: category_id };
    Paginate(querys, options, res, '文章列表获取成功！', '文章列表获取失败！');
  }
});


// 通用-根据ID获取单个文章
articleCtrl.common.querySingle = new Controller({
  method: 'GET',
  callback: ({ params: { article_id } }, res) => {
    let querys = { ...appQuerys, _id: article_id };

    // 将内容转换为markdown格式
    Article.find(querys)
      .then(data => {
        // console.log(data[0].content)
        data[0].content = turndownService.turndown(data[0].content);
        console.log(data[0])
        handleSuccess({ res, message: '文章获取成功', data: data[0] });
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
      sort: { _id: -1 },
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
    Article.find({ title })
      .then(articles => {
        articles.length && handleError({ res, message: "文章已存在！" });
        articles.length || saveArticle();
      })
      .catch(err => handleError({ res, err, message: '保存失败！' }))
  }
});

// 批量修改文章（移回收站、回收站恢复）
articleCtrl.admin.changeStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { id, status } }, res) => {
    // 验证
    if (!id) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    // // 要改的数据
    // let updatePart = {};

    Article.update({ 'id': { $in: id } }, { $set: { status } }, { multi: true })
      .then(data => {
        handleSuccess({ res, data, message: '操作成功' });
      })
      .catch(err => {
        // console.log(err)
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
    delete article.meta
    delete article.create_at
    delete article.update_at

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

exports.common = {
  querySingle: (req, res) => handleRequest({ req, res, controller: articleCtrl.common.querySingle })
}