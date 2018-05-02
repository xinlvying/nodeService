/*
*
* APP客户端API路由模块
*
*/

const express = require('express');
const router = express.Router();

const { handleRequest, handleError, handleSuccess } = require('../../rn-utils/handler');
const config = require('../../app.config');
const path = require('./path.config');
const controller = require('../../rn-controller');
const authIsVerified = require('../../rn-utils/authentication');

// router.all('*')

// router.all('/sms', controller.sms);
// Banner
router.all(`${path.banner}/:position`, controller.banner.app.querySingle);

// Article
router.all(`${path.article}`, controller.article.app.query);
router.all(`${path.article}/category/:category_id`, controller.article.app.queryByCategoryId);
router.all(`${path.article}/:article_id`, controller.article.common.querySingle);

// Category
router.all(`${path.category}`, controller.category.common.query);
router.all(`${path.category}/:code`, controller.category.common.single);


module.exports = router;