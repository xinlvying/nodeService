/*
* 用户偏好控制器
*/

const config = require('../app.config');
const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const UserCollection = require('../rn-model/user.collection.model');
const ReadingRecord = require('../rn-model/reading.record.model');

const userPreferenceCtrl = {
  admin: {},
  common: {},
  app: {}
};

// /**
//  * 分页查询函数
//  * @param {*查询条件} querys 
//  * @param {*分页配置} options 
//  * @param {*http请求返回体} res 
//  * @param {*成功提示} successMsg 
//  * @param {*错误提示} errMsg 
//  */
// const Paginate = (querys, options, res, successMsg = '操作成功', errMsg = '操作失败') => {
//   Answer.paginate(querys, options)
//     .then(results => {
//       handleSuccess({
//         res,
//         message: successMsg,
//         data: {
//           pagination: {
//             total: results.total,
//             current_page: results.page,
//             total_page: results.pages,
//             per_page: results.limit
//           },
//           data: results.docs
//         }
//       })
//     })
//     .catch(err => {
//       handleError({ res, err, message: errMsg });
//     })
// };

// 组合查询回答
// userPreferenceCtrl.admin.queryCombine = new Controller({
//   method: 'POST',
//   callback: ({ body }, res) => {
//     // 过滤条件
//     const options = {
//       sort: { create_at: -1 },
//       page: Number(body.page || 1),
//       limit: Number(body.per_page || 10),
//       populate: ['question'],
//     };
//     let querys = {};
//     for (let key of Object.keys(body)) {
//       if (key != 'page' && key != 'per_page') {
//         querys[key] = body[key];
//       }
//     }

//     Paginate(querys, options, res, '匿名回答列表获取成功！', '匿名回答列表获取失败！');
//   }
// });

userPreferenceCtrl.app.addReadingRecord = new Controller({
  method: 'POST',
  callback: ({ body: readingRecord }, res) => {
    console.log(readingRecord);
    if (!readingRecord.article || !readingRecord.user) {
      handleError({ res, err: '缺少必要参数', message: '缺少必要参数' });
      return false;
    }

    if (!readingRecord.rating) readingRecord.rating = 0

    // 保存浏览记录
    const saveReadingRecord = () => {
      new ReadingRecord(readingRecord).save()
        .then((result = readingRecord) => {
          handleSuccess({ res, result, message: '浏览记录保存成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '浏览记录保存失败' });
        })
    }

    const updateReadingRecord = (_id, rating) => {
      ReadingRecord.update({ '_id': { $in: _id } }, { $set: { rating } }, { multi: true })
        .then(data => {
          handleSuccess({ res, result, message: '浏览记录保存成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '浏览记录保存失败' });
        })
    }

    // 验证readingRecord合法性
    const article = readingRecord.article;
    const user = readingRecord.user;
    const find = ReadingRecord.find({ article, user });
    const promise = find.exec();
    promise.then(record => {
      if (record.length) {
        record[0].rating < readingRecord.rating ?
          updateReadingRecord(record[0]._id, readingRecord.rating) :
          handleSuccess({ res, message: '浏览记录保存成功' });
      } else saveReadingRecord();
    })
      .catch(err => {
        handleError({ res, err, message: '保存失败！' })
      })
  }
});


userPreferenceCtrl.app.addCollection = new Controller({
  method: 'POST',
  callback: ({ body: collection }, res) => {
    console.log(collection);
    if (!collection.article || !collection.user) {
      handleError({ res, err: '缺少必要参数', message: '缺少必要参数' });
      return false;
    }

    // 保存用户收藏
    const saveCollection = () => {
      let saveModel = {
        user,
        article: [collection.article]
      };
      new UserCollection(saveModel).save()
        .then((result = saveModel) => {
          handleSuccess({ res, result, message: '收藏成功' });
        })
        .catch(err => {
          handleError({ res, err, message: '收藏失败' });
        })
    }

    const user = collection.user;
    const find = UserCollection.find({ user });
    const promise = find.exec();
    promise.then(result => {
      if (result.length) {
        UserCollection.update({ 'user': collection.user }, { $addToSet: { articles: collection.article } })
          .then(data => {
            console.log(data);
            handleSuccess({ res, result, message: '收藏成功' });
          })
          .catch(err => {
            handleError({ res, err, message: '收藏失败' });
          });
      } else saveCollection();
    })
      .catch(err => {
        handleError({ res, err, message: '保存失败！' })
      })


  }
})

userPreferenceCtrl.app.deleteCollection = new Controller({
  method: 'POST',
  callback: ({ body: collection }, res) => {
    if (!collection.article || !collection.user) {
      handleError({ res, err: '缺少必要参数', message: '缺少必要参数' });
      return false;
    }

    UserCollection.update({ 'user': collection.user }, { $pull: { articles: collection.article } })
      .then(data => {
        handleSuccess({ res, result, message: '取消收藏成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '取消收藏失败' });
      })
  }
});

// export
exports.app = (({ app }) => {
  let res = {};
  for (let key of Object.keys(app)) {
    res[key] = (req, res) => handleRequest({ req, res, controller: app[key] })
  }
  return res;
})(userPreferenceCtrl);

exports.admin = (({ admin }) => {
  let res = {};
  for (let key of Object.keys(admin)) {
    res[key] = (req, res) => handleRequest({ req, res, controller: admin[key] })
  }
  return res;
})(userPreferenceCtrl);