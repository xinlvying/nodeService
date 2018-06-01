/*
* 匿名回答控制器
*/

const config = require('../app.config');
const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const Answer = require('../rn-model/answer.model');
const Question = require('../rn-model/question.model');

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
      populate: ['question'],
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
  callback: ({ body: answer }, res) => {
    // console.log(answer)
    if (!answer.question || !answer.content) {
      handleError({ res, err: '缺少必要参数', message: '缺少必要参数' });
      return false;
    }

    const handleSaveAnswer = (answer) => {
      return new Promise((resolve, reject) => {
        // 保存回答
        new Answer(answer).save()
          .then(result => {
            if (result.status == 1) resolve(result);
            else handleSuccess({ res, result, message: '回答发布成功' });
          })
          .catch(err => {
            if (answer.status == 1) resolve(err);
            else handleError({ res, err, message: '回答发布失败' });
          })
      });
    };

    const handlePushAnswer = (questionId, answerId, status) => {
      return new Promise((reslove, reject) => {
        status == 1 && Question.update({ '_id': questionId }, { $push: { answers: answerId } })
          .then(data => {
            // console.log(data);
            reslove(data);
          })
          .catch(err => {
            reject(err);
          })
      });
    };

    async function handleAddAndPushAnswer(answer) {
      const addResult = await handleSaveAnswer(answer);
      // // console.log(addResult);
      let pushAnswerResult;
      if (addResult.status == 1)
        pushAnswerResult = await handlePushAnswer(answer.question, addResult._id, 1);
    }

    handleAddAndPushAnswer(answer)
      .then(data => {
        handleSuccess({ res, data, message: '回答发布成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '回答发布失败' });
      })
  }
});


answerCtrl.admin.updateStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { answerId, questionId, status } }, res) => {
    // 验证
    if (!answerId || !questionId) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    const handleUpdate = (answerId, status) => {
      return new Promise((reslove, reject) => {
        Answer.update({ '_id': { $in: answerId } }, { $set: { status } }, { multi: true })
          .then(data => {
            reslove(data);
          })
          .catch(err => {
            reject(err);
          })
      });
    };

    const handlePushAnswer = (answerId, questionId, status) => {
      return new Promise((reslove, reject) => {
        status == 1 && Question.update({ '_id': { $in: questionId } }, { $addToSet: { answers: answerId } })
          .then(data => {
            reslove(data);
          })
          .catch(err => {
            reject(err);
          });
        status == 2 && Question.update({ '_id': { $in: questionId } }, { $pull: { answers: answerId } })
          .then(data => {
            reslove(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    };

    async function handleUpdateAndPushAnswer(answerId, questionId, status) {
      const updateResult = await handleUpdate(answerId, status);
      const pushAnswerResult = await handlePushAnswer(answerId, questionId, status);
    }

    handleUpdateAndPushAnswer(answerId, questionId, status)
      .then(data => {
        // console.log(data);
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

// 组合查询回答
answerCtrl.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(body.page || 1),
      limit: Number(body.per_page || 10),
      populate: ['question'],
    };
    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'page' && key != 'per_page') {
        querys[key] = body[key];
      }
    }
    Paginate(querys, options, res, '回答列表获取成功！', '回答列表获取失败！');
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