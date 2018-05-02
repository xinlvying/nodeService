/*
*
* 管理员后台API路由模块
*
*/

const express = require('express');
const router = express.Router();

const config = require('../../app.config');
const path = require('./path.config');
const controller = require('../../rn-controller');
const authIsVerified = require('../../rn-utils/authentication');

// router.all('*')

// router.all('/sms', controller.sms);

// Banner
router.all(`${path.banner}/query`, controller.banner.admin.queryCombine);
router.all(`${path.banner}/add`, controller.banner.admin.add);
router.all(`${path.banner}/update-status`, controller.banner.admin.changeStatus);


// Category
router.all(`${path.category}`, controller.category.common.query);
router.all(`${path.category}/publish`, controller.category.admin.publish);

// Article
router.all(`${path.article}/query`, controller.article.admin.queryCombine);
router.all(`${path.article}/update-status`, controller.article.admin.changeStatus);
router.all(`${path.article}/publish`, controller.article.admin.publish);
router.all(`${path.article}/query/:article_id`, controller.article.common.querySingle);
router.all(`${path.article}/update/:article_id`, controller.article.admin.update);

// 
router.all('/upload', controller.upload);



module.exports = router;