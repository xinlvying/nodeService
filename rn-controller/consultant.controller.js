/**
 * 咨询师控制器
 */

const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');
const config = require('../app.config');

const Consultant = require('../rn-model/consultant.model');

const consultantCtrl = {
  app: {},
  admin: {},
  common: {}
};

const appQuerys = {
  status: 1,
  public: 1
}

const Paginate = (querys, options, res, successMsg = '操作成功', errMsg = '操作失败') => {
  Consultant.paginate(querys, options)
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

consultantCtrl.app.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    console.log(body);
    // return false;

    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'week') {
        querys[key] = body[key];
      }
    }

    // 请求
    const find = Consultant.find({ ...querys });
    const promise = find.exec();

    promise
      .then(data => {
        // handleSuccess({ res, data, message: '咨询师列表获取成功' });
        handleError({ res, code: 500, message: '咨询师列表获取失败' });
      })
      .catch(err => {
        handleError({ res, err, message: '咨询师列表获取失败' });
      })
  }
});

consultantCtrl.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // console.log(body);
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

consultantCtrl.admin.add = new Controller({
  method: 'POST',
  callback: ({ body: consultant }, res) => {
    // console.log(consultant)
    // 验证
    if (!consultant.name || !consultant.gender || !consultant.onduty_day ||
      !consultant.onduty_time || !consultant.description || !consultant.photo) {
      handleError({ res, message: '内容不合法' });
      return false;
    }

    // 保存咨询师
    const saveConsultant = () => {
      new Consultant(consultant).save()
        .then((result) => {
          handleSuccess({ res, result, message: '保存成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '保存失败' });
        })
    }

    // 验证咨询师合法性
    const name = consultant.name;
    Consultant.find({ name })
      .then(consultant => {
        consultant.length && handleError({ res, message: "该咨询师已存在！" });
        consultant.length || saveConsultant();
      })
      .catch(err => handleError({ res, err, message: err }))
  }
});



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
exports.app = {
  queryCombine: (req, res) => { handleRequest({ req, res, controller: consultantCtrl.app.queryCombine }) }
}
exports.admin = {
  add: (req, res) => { handleRequest({ req, res, controller: consultantCtrl.admin.add }) },
  queryCombine: (req, res) => { handleRequest({ req, res, controller: consultantCtrl.admin.queryCombine }) }
}
