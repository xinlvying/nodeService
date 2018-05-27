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

// sms login
router.all('/sms', controller.sms.app.getSmsCode);
router.all('/login', controller.sms.app.login);

// Banner
router.all(`${path.banner}/:position`, controller.banner.app.querySingle);

// Article
router.all(`${path.article}`, controller.article.app.query);
router.all(`${path.article}/category/:category_id`, controller.article.app.queryByCategoryId);
router.all(`${path.article}/:article_id`, controller.article.common.querySingle);

// Category
router.all(`${path.category}`, controller.category.common.query);
router.all(`${path.category}/:code`, controller.category.common.single);

// Consultant
router.all(`${path.consultant}/app-query`, controller.consultant.app.queryCombine);

// Calendar
router.all(`${path.calendar}/single`, controller.calendar.common.single);

// 咨询记录
router.all(`${path.consultRecord}/add`, controller.consultRecord.common.add);
router.all(`${path.consultRecord}/query-by-time/:consult_time`, controller.consultRecord.common.queryByTime);

// 匿名问题
router.all(`${path.question}/add`, controller.question.common.add);
router.all(`${path.question}/app-query`, controller.question.app.list);
router.all(`${path.question}/:_id`, controller.question.app.querySingle);

// 匿名回答
router.all(`${path.answer}/add`, controller.answer.common.add);

module.exports = router;