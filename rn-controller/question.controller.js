/*
* 匿名问题控制器
*/

const config = require('../app.config');
const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const Question = require('../rn-model/question.model');


const questionCtrl = {
  app: {},
  admin: {},
  common: {}
};


/**
 * 分页查询函数
 * @param {*查询条件} querys 
 * @param {*分页配置} options 
 * @param {*http请求返回体} res 
 * @param {*成功提示} successMsg 
 * @param {*错误提示} errMsg 
 */
const Paginate = (querys, options, res, successMsg = '操作成功', errMsg = '操作失败') => {
  Question.paginate(querys, options)
    .then(results => {
      handleSuccess({
        res,
        message: successMsg,
        data: {
          pagination: {
            total: results.total,
            current_page: results.page,
            total_page: results.pages,
            per_page: results.limit
          },
          data: results.docs
        }
      })
    })
    .catch(err => {
      handleError({ res, err, message: errMsg });
    })
};

// 客户端分页获取问题
questionCtrl.app.list = new Controller({
  method: 'POST',
  callback: ({ body: { page, per_page } }, res) => {
    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(page || 1),
      limit: Number(per_page || 10),
      populate: ['answer']
    };

    Paginate({ status: 1 }, options, res, '问题列表获取成功！', '问题列表获取失败！');
  }
});

// 组合查询问题
questionCtrl.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(body.page || 1),
      limit: Number(body.per_page || 10),
      populate: ['answers']
    };
    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'page' && key != 'per_page') {
        querys[key] = body[key];
      }
    }
    Paginate(querys, options, res, '问题列表获取成功！', '问题列表获取失败！');
  }
});

questionCtrl.common.add = new Controller({
  method: 'POST',
  callback: ({ body: question }, res) => {
    if (!question.title || !question.content) {
      handleError({ res, err: '缺少必要参数', message: '缺少必要参数' });
      return false;
    }

    // 保存问题
    const saveQuestion = () => {
      new Question(question).save()
        .then((result = question) => {
          handleSuccess({ res, result, message: '问题发布成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '问题发布失败' });
        })
    }

    // 验证问题合法性
    const title = question.title;
    const find = Question.find({ title });
    const promise = find.exec();
    promise.then(questions => {
      if (questions.length) {
        handleError({ res, message: "问题已存在！" });
      } else saveQuestion();
    })
      .catch(err => {
        handleError({ res, err, message: '问题发布失败！' })
      })
  }
});


// 客户端-根据ID获取单个问题
questionCtrl.app.querySingle = new Controller({
  method: 'GET',
  callback: ({ params: { _id } }, res) => {

    Question.findOne({ _id }).populate('answers').exec()
      .then(data => {
        handleSuccess({ res, message: '匿名问题获取成功', data });
      })
      .catch(err => handleError({ res, message: '匿名问题获取失败', err }))
  }
});

questionCtrl.admin.updateStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { id, status } }, res) => {
    // 验证
    if (!id) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    Question.update({ 'id': { $in: id } }, { $set: { status } }, { multi: true })
      .then(data => {
        handleSuccess({ res, data, message: '操作成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '操作失败' });
      })
  }
});

questionCtrl.admin.delete = new Controller({
  method: 'POST',
  callback: ({ body: { login_phone, sms_code } }, res) => {

  }
});

// exports.app = {
//   queryCombine: (req, res) => { handleRequest({ req, res, controller: questionCtrl.app.queryCombine }) }
// }
exports.admin = {
  updateStatus: (req, res) => { handleRequest({ req, res, controller: questionCtrl.admin.updateStatus }) },
  delete: (req, res) => { handleRequest({ req, res, controller: questionCtrl.admin.delete }) },
  queryCombine: (req, res) => { handleRequest({ req, res, controller: questionCtrl.admin.queryCombine }) },
}
exports.common = {
  add: (req, res) => { handleRequest({ req, res, controller: questionCtrl.common.add }) },
}
exports.app = {
  list: (req, res) => { handleRequest({ req, res, controller: questionCtrl.app.list }) },
  querySingle: (req, res) => { handleRequest({ req, res, controller: questionCtrl.app.querySingle }) }
}