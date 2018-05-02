/**
 * banner资源控制器
 */

// 引入工具函数
const Controller = require('../rn-utils/controller.generator');
const authIsVerified = require('../rn-utils/authentication');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

// 引入数据模型
const Banner = require('../rn-model/bunner.model');

const bannerCtrl = {
  app: {},
  admin: {}
};

// 客户端查询单个位置的banner
bannerCtrl.app.querySingle = new Controller({
  method: 'GET',
  callback: ({ params: { position } }, res) => {
    // 参数为空报错
    if (!position) {
      handleError({ res, message: 'position不能为空！' });
      return false;
    }

    // 默认前台查询启用banner
    let querys = { status: 1, position: position };

    const getBanners = Banner.find(querys).exec();
    getBanners
      .then(data => handleSuccess({ res, data, message: 'banner获取成功！' }))
      .catch(err => handleError({ res, err, message: 'banner获取失败！' }))
  }
});

// 管理端组合分业查询
bannerCtrl.admin.queryCombine = new Controller({
  method: 'POST',
  callback: ({ body }, res) => {
    // 过滤条件
    const options = {
      sort: { _id: -1 },
      page: Number(body.page || 1),
      limit: Number(body.per_page || 10),
      populate: ['article_id'],
    };

    let querys = {};
    for (let key of Object.keys(body)) {
      if (key != 'page' && key != 'per_page') {
        querys[key] = body[key];
      }
    }

    Banner.paginate(querys, options)
      .then(data => handleSuccess({
        res,
        data: {
          pagination: {
            total: data.total,
            current_page: data.page,
            total_page: data.pages,
            per_page: data.limit
          },
          data: data.docs
        },
        message: "成功！"
      }))
      .catch(err => handleError({ res, err, message: err }))
  }
});

// 管理端新增
bannerCtrl.admin.add = new Controller({
  method: 'POST',
  callback: ({ body: banner }, res) => {
    // 前端传值校验
    if ((!banner.position) || (!banner.img_url) || (!banner.title)) {
      handleError({ res, message: "非法参数！" });
      return false;
    }

    // 保存banner函数
    const saveBanner = () => {
      new Banner(banner).save()
        .then(data => {
          handleSuccess({ res, data, message: "保存成功！" })
        })
        .catch(err => handleError({ res, err, message: '保存失败！' }))
    };

    // 验证banner合法性
    Banner.find({ banner })
      .then(banners => {
        banners.length && handleError({ res, message: "该banner已存在！" });
        banners.length || saveBanner();
      })
      .catch(err => handleError({ res, err, message: '保存失败！' }))
  }
});

// 管理端更改（支持批量）banner状态
bannerCtrl.admin.changeStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { ids, status } }, res) => {
    // 验证
    if (!ids || !ids.length) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    Banner.update({ 'id': { $in: ids } }, { $set: { status } }, { multi: true })
      .then(data => {
        handleSuccess({ res, data, message: '操作成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '操作失败' });
      })
  }
})

// 管理端修改banner
// bannerCtrl.admin.update = new Controller({
//   method: 'PUT',
//   callback: ({ params: { banner_id }, body: banner }, res) => {
//     // 验证
//     if (!banner.title || !banner.content) {
//       handleError({ res, message: '内容不合法' });
//       return false;
//     };

//     // 修正信息
//     delete banner.meta
//     delete banner.create_at
//     delete banner.update_at
//   }
// })

exports.app = {
  querySingle: (req, res) => handleRequest({ req, res, controller: bannerCtrl.app.querySingle }),
}
exports.admin = {
  queryCombine: (req, res) => handleRequest({ req, res, controller: bannerCtrl.admin.queryCombine }),
  add: (req, res) => handleRequest({ req, res, controller: bannerCtrl.admin.add }),
  changeStatus: (req, res) => handleRequest({ req, res, controller: bannerCtrl.admin.changeStatus })
}