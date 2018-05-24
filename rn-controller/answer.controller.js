/*
* 匿名回答控制器
*/

const config = require('../app.config');
const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const Answer = require('../rn-model/answer.model');

const answerCtrl = {
  admin: {},
  common: {},
  app: {}
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
  Answer.paginate(querys, options)
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

// 组合查询回答
answerCtrl.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(body.page || 1),
      limit: Number(body.per_page || 10),
      populate: ['answer'],
    };
    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'page' && key != 'per_page') {
        querys[key] = body[key];
      }
    }

    Paginate(querys, options, res, '匿名回答列表获取成功！', '匿名回答列表获取失败！');
  }
});

answerCtrl.common.add = new Controller({
  method: 'POST',
  callback: ({ body: { answer } }, res) => {
    if (!answer.question || !answer.content) {
      handleError({ res, err: '缺少必要参数', message: '缺少必要参数' });
      return false;
    }

    // 保存回答
    new Answer(answer).save()
      .then((result = answer) => {
        handleSuccess({ res, result, message: '回答发布成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '回答发布失败' });
      })
  }
});


answerCtrl.admin.updateStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { id, status } }, res) => {
    // 验证
    if (!id) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    Answer.update({ 'id': { $in: id } }, { $set: { status } }, { multi: true })
      .then(data => {
        handleSuccess({ res, data, message: '操作成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '操作失败' });
      })
  }
});

answerCtrl.admin.delete = new Controller({
  method: 'POST',
  callback: ({ body: { login_phone, sms_code } }, res) => {

  }
});

answerCtrl.app.querySingleQuestionAnswer = new Controller({
  method: 'GET',
  callback: ({ params: { _id } }, res) => {
    Answer.find({ question: _id }).exec()
      .then(data => {
        handleSuccess({ res, message: '匿名回答获取成功', data });
      })
      .catch(err => handleError({ res, message: '匿名回答获取失败', err }))
  }
});

exports.admin = {
  queryCombine: (req, res) => { handleRequest({ req, res, controller: answerCtrl.admin.queryCombine }) },
  updateStatus: (req, res) => { handleRequest({ req, res, controller: answerCtrl.admin.updateStatus }) },
  delete: (req, res) => { handleRequest({ req, res, controller: answerCtrl.admin.delete }) },
}
exports.common = {
  add: (req, res) => { handleRequest({ req, res, controller: answerCtrl.common.add }) }
}
exports.app = {
  querySingleQuestionAnswer: (req, res) => { handleRequest({ req, res, controller: answerCtrl.app.querySingleQuestionAnswer }) }
}