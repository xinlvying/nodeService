/*
*
* 校历周次计算控制器
*
*/

const Controller = require('../rn-utils/controller.generator');
const authIsVerified = require('../rn-utils/authentication');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const calendar = {
  app: {},
  admin: {},
  common: {}
};

const Calendar = require('../rn-model/academic.calendar.model');



const Paginate = (querys, options, res, successMsg = '操作成功', errMsg = '操作失败') => {
  Calendar.paginate(querys, options)
    .then(result => {
      handleSuccess({
        res,
        message: successMsg,
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
      handleError({ res, err, message: errMsg })
    })
}

// admin-分页查询学期的起止时间
calendar.admin.query = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // // console.log(body);
    // 过滤条件
    const options = {
      sort: { _id: -1 },
      page: Number(body.page || 1),
      limit: Number(body.per_page || 10),
    };

    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'page' && key != 'per_page') {
        querys[key] = body[key];
      }
    }

    Paginate(querys, options, res);
  }
});

// 新增学期
calendar.admin.add = new Controller({
  method: 'POST',
  callback: ({ body: term }, res) => {

    // 验证
    // // console.log(term);
    if (!term.title || !term.begin_at || !term.end_at) {
      handleError({ res, message: '参数错误' });
      return false;
    }
    // 保存分类
    const saveTerm = () => {
      new Calendar(term).save()
        .then(result => {
          handleSuccess({ res, result, message: '新增学期成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '新增学期失败' });
        })
    };

    // 验证学期合法性
    const find = Calendar.find(term);
    const promise = find.exec();
    promise
      .then(terms => {
        terms.length && handleError({ res, message: '该学期已存在' });
        terms.length || saveTerm();
      })
      .catch(err => {
        handleError({ res, err, message: '保存失败' });
      })
  }
})


calendar.common.single = new Controller({
  method: 'GET',
  callback: ({ query: { time } }, res) => {
    let date = time ? new Date(time) : new Date();
    let result = {};

    const getTerms = Calendar.find({ 'begin_at': { $lte: date } }).exec();
    getTerms.then(terms => {
      if (terms && terms.length) {
        terms.map((term, index) => {
          if (term.end_at >= date) {
            // // console.log(term.begin_at, typeof (term.begin_at))
            let ms = date.getTime() - term.begin_at.getTime();
            let week = Math.ceil(ms / (60 * 60 * 24 * 1000) / 7);
            // // console.log(ms / (60 * 60 * 24 * 1000) / 7);
            global._CurrentWeek = week;
            result = { term, week: week };
          }
        })
      }
      handleSuccess({ res, message: '操作成功', data: result });
    })

  }
})

// export
exports.admin = {
  add: (req, res) => { handleRequest({ req, res, controller: calendar.admin.add }) },
  query: (req, res) => { handleRequest({ req, res, controller: calendar.admin.query }) }
}
exports.common = {
  single: (req, res) => { handleRequest({ req, res, controller: calendar.common.single }) }
}