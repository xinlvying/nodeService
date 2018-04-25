/*
*
* 分类控制器
*
*/

const config = require('../app.config');

const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const authIsVerified = require('../rn-utils/authentication');

const Category = require('../rn-model/article.category.model');
const Article = require('../rn-model/article.model');

const categoryCtrl = { list: {}, item: {} };

// 获取分类列表
categoryCtrl.list.GET = (req, res) => {

  let { page = 1, per_page = 10 } = req.query;

  // 过滤条件
  const options = {
    sort: { _id: 1 },
    page: Number(page),
    limit: Number(per_page)
  };

  const querySuccess = categories => {
    handleSuccess({
      res,
      message: '分类列表获取成功',
      result: {
        pagination: {
          total: categories.total,
          current_page: options.page,
          total_page: categories.pages,
          per_page: options.limit
        },
        data: categories.docs
      }
    });
  };

  // 查询article-category的count聚合数据
  const getCatrgoriesCount = categories => {
    let $match = {};
    if (!authIsVerified(req)) {
      $match = { state: 1, public: 1 };
    }
    Article.aggregate([
      { $match },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category",
          num_tutorial: { $sum: 1 }
        }
      }
    ])
      .then(counts => {
        const newCtefories = categories.docs.map(t => {
          const finded = counts.find(c => String(c._id) === String(t._id));
          t.count = finded ? finded.num_tutorial : 0;
          return t;
        });
        categories.docs = newCtefories;
        querySuccess(categories);
      })
      .catch(err => {
        querySuccess(categories);
      })
  };

  // 请求
  Category.paginate({}, options)
    .then(categories => {
      categories = JSON.parse(JSON.stringify(categories));
      getCatrgoriesCount(categories);
    })
    .catch(err => {
      handleError({ res, err, message: '分类列表获取失败' });
    })
};

// 发布分类
categoryCtrl.list.POST = ({ body: category }, res) => {

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
  Category.find({ category })
    .then(categories => {
      categories.length && handleError({ res, message: 'category已被占用' });
      categories.length || saveCategory();
    })
    .catch(err => {
      handleError({ res, err, message: '分类发布失败' });
    })
};

// 批量删除分类
categoryCtrl.list.DELETE = ({ body: { categories } }, res) => {

  // 验证
  if (!categories || !categories.length) {
    handleError({ res, message: '缺少有效参数' });
    return false;
  };

  // 把所有pid为categories中任何一个id的分类分别提升到自己分类本身的PID分类或者null
  Category.remove({ '_id': { $in: categories } })
    .then(result => {
      handleSuccess({ res, result, message: '分类批量删除成功' });
    })
    .catch(err => {
      handleError({ res, err, message: '分类批量删除失败' });
    })
};

// 删除单个分类
categoryCtrl.item.DELETE = ({ params: { category_id } }, res) => {

  // delete category
  const deleteCategory = () => {
    return Category.findByIdAndRemove(category_id);
  };

  // delete pid
  const deletePid = category => {
    return new Promise((resolve, reject) => {
      Category.find({ pid: category_id })
        .then(categories => {
          // 如果没有子分类
          if (!categories.length) {
            resolve({ result: category });
            return false;
          };
          // 否则更改父分类的子分类
          let _category = Category.collection.initializeOrderedBulkOp();
          _category.find({ '_id': { $in: Array.from(categories, c => c._id) } }).update({ $set: { pid: category.pid || null } });
          _category.execute((err, data) => {
            err ? reject({ err }) : resolve({ result: category });
          })
        })
        .catch(err => reject({ err }))
    })
  };

  (async () => {
    let category = await deleteCategory();
    return await deletePid(category);
  })()
    .then(({ result }) => {
      handleSuccess({ res, result, message: '分类删除成功' });
      buildSiteMap();
    })
    .catch(({ err }) => handleError({ res, err, message: '分类删除失败' }));
};

// export
exports.list = (req, res) => { handleRequest({ req, res, controller: categoryCtrl.list }) };
exports.item = (req, res) => { handleRequest({ req, res, controller: categoryCtrl.item }) };