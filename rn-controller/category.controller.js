/*
*
* 分类控制器
*
*/

const config = require('../app.config');
const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');

const Category = require('../rn-model/article.category.model');
const Article = require('../rn-model/article.model');

const categoryCtrl = {
  app: {},
  admin: {},
  common: {}
};

// 通用-获取分类列表
categoryCtrl.common.query = new Controller({
  method: 'GET',
  callback: (req, res) => {
    // 请求
    const find = Category.find({});
    const promise = find.exec();
    promise
      .then(data => {
        handleSuccess({ res, data, message: '分类列表获取成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '分类列表获取失败' });
      })
  }
});

// 通用-根据名字获取分类
categoryCtrl.common.queryByName = new Controller({
  method: 'GET',
  callback: ({ params: { name } }, res) => {
    // 请求
    const find = Category.find({ name });
    const promise = find.exec();
    promise
      .then(data => {
        handleSuccess({ res, data, message: '分类获取成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '分类获取失败' });
      })
  }
});

// 通用-根据code获取分类
categoryCtrl.common.single = new Controller({
  method: 'GET',
  callback: ({ params: { code } }, res) => {
    // 请求
    const find = Category.find({ code });
    const promise = find.exec();
    promise
      .then(data => {
        handleSuccess({ res, data, message: '分类列表获取成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '分类列表获取失败' });
      })
  }
});


// 发布分类
categoryCtrl.admin.publish = new Controller({
  method: 'POST',
  callback: ({ body: category }, res) => {

    // 验证
    if (!category.pid) {
      delete category.pid;
    };

    // 保存分类
    const saveCategory = () => {
      new Category(category).save()
        .then(result => {
          handleSuccess({ res, result, message: '分类发布成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '分类发布失败' });
        })
    };

    // 验证category合法性
    const find = Category.find(category);
    const promise = find.exec();
    promise
      .then(categories => {
        console.log(categories.length);
        categories.length && handleError({ res, message: 'category已被占用' });
        categories.length || saveCategory();
      })
      .catch(err => {
        handleError({ res, err, message: '分类发布失败' });
      })
  }
})

// export
exports.admin = {
  publish: (req, res) => { handleRequest({ req, res, controller: categoryCtrl.admin.publish }) }
}
exports.common = {
  query: (req, res) => { handleRequest({ req, res, controller: categoryCtrl.common.query }) },
  queryByName: (req, res) => { handleRequest({ req, res, controller: categoryCtrl.common.queryByName }) },
  single: (req, res) => { handleRequest({ req, res, controller: categoryCtrl.common.single }) }
}