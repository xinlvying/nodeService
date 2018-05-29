/**
 * 咨询记录控制器
 */

const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');
const config = require('../app.config');

const ConsultantRecord = require('../rn-model/consult.record.model');

const consultantRecord = {
  app: {},
  admin: {},
  common: {}
};

const appQuerys = {
  status: 1,
  public: 1
}

const Paginate = (querys, options, res, successMsg = '操作成功', errMsg = '操作失败') => {
  ConsultantRecord.paginate(querys, options)
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

consultantRecord.common.queryByTime = new Controller({
  method: 'GET',
  callback: ({ params: { consult_time } }, res) => {
    let date;
    if (consult_time) date = new Date(consult_time);
    else handleError({res,message:'参数不能为空'});
    // 请求

    const promise = ConsultantRecord.find({ 'consult_date': { $gte: date } }).exec();
    promise
      .then(data => {
        // // console.log(data)
        handleSuccess({ res, data, message: '咨询预约记录获取成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '咨询预约记录获取失败' });
      })
  }
});

consultantRecord.common.add = new Controller({
  method: 'POST',
  callback: ({ body: consultantRecord }, res) => {
    // // console.log(consultantRecord)
    // 验证
    if (!consultantRecord.visitor_tel || !consultantRecord.consultant_id || !consultantRecord.consult_time ||
      !consultantRecord.consult_week || !consultantRecord.consult_weekday) {
      handleError({ res, message: '内容不合法' });
      return false;
    }
    // 保存咨询记录
    const saveConsultantRecord = () => {
      new ConsultantRecord(consultantRecord).save()
        .then((result) => {
          handleSuccess({ res, result, message: '保存成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '保存失败' });
        })
    }

    // 验证咨询师合法性
    let visitor_tel = consultantRecord.visitor_tel;
    let consultant_id = consultantRecord.consultant_id;
    let consult_time = consultantRecord.consult_time;

    ConsultantRecord.find({ visitor_tel, consultant_id, consult_time })
      .then(consultantRecord => {
        consultantRecord.length && handleError({ res, message: "该预约记录已存在！" });
        consultantRecord.length || saveConsultantRecord();
      })
      .catch(err => handleError({ res, err, message: err }))
  }
});

consultantRecord.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
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
})


// // 批量删除分类
// categoryCtrl.list.DELETE = ({ body: { categories } }, res) => {

//   // 验证
//   if (!categories || !categories.length) {
//     handleError({ res, message: '缺少有效参数' });
//     return false;
//   };

//   // 把所有pid为categories中任何一个id的分类分别提升到自己分类本身的PID分类或者null
//   Category.remove({ '_id': { $in: categories } })
//     .then(result => {
//       handleSuccess({ res, result, message: '分类批量删除成功' });
//     })
//     .catch(err => {
//       handleError({ res, err, message: '分类批量删除失败' });
//     })
// };

// // 删除单个分类
// categoryCtrl.item.DELETE = ({ params: { category_id } }, res) => {

//   // delete category
//   const deleteCategory = () => {
//     return Category.findByIdAndRemove(category_id);
//   };

//   // delete pid
//   const deletePid = category => {
//     return new Promise((resolve, reject) => {
//       Category.find({ pid: category_id })
//         .then(categories => {
//           // 如果没有子分类
//           if (!categories.length) {
//             resolve({ result: category });
//             return false;
//           };
//           // 否则更改父分类的子分类
//           let _category = Category.collection.initializeOrderedBulkOp();
//           _category.find({ '_id': { $in: Array.from(categories, c => c._id) } }).update({ $set: { pid: category.pid || null } });
//           _category.execute((err, data) => {
//             err ? reject({ err }) : resolve({ result: category });
//           })
//         })
//         .catch(err => reject({ err }))
//     })
//   };

//   (async () => {
//     let category = await deleteCategory();
//     return await deletePid(category);
//   })()
//     .then(({ result }) => {
//       handleSuccess({ res, result, message: '分类删除成功' });
//       buildSiteMap();
//     })
//     .catch(({ err }) => handleError({ res, err, message: '分类删除失败' }));
// };

// export
// exports.admin = {
//   add: (req, res) => { handleRequest({ req, res, controller: consultantRecord.admin.add }) },
//   queryCombine: (req, res) => { handleRequest({ req, res, controller: consultantRecord.admin.queryCombine }) }
// }
exports.common = {
  add: (req, res) => { handleRequest({ req, res, controller: consultantRecord.common.add }) },
  queryByTime: (req, res) => { handleRequest({ req, res, controller: consultantRecord.common.queryByTime }) }
}
