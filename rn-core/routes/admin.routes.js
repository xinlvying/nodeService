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
router.all(`${path.category}/:name`, controller.category.common.queryByName);
router.all(`${path.category}/publish`, controller.category.admin.publish);

// Article
router.all(`${path.article}/query`, controller.article.admin.queryCombine);
router.all(`${path.article}/update-status`, controller.article.admin.changeStatus);
router.all(`${path.article}/publish`, controller.article.admin.publish);
router.all(`${path.article}/query/:article_id`, controller.article.common.querySingle);
router.all(`${path.article}/update/:article_id`, controller.article.admin.update);

// 
router.all('/upload', controller.upload);

// Consultant
router.all(`${path.consultant}/add`, controller.consultant.admin.add);
router.all(`${path.consultant}/admin-query`, controller.consultant.admin.queryCombine);

// ConsultRecord
router.all(`${path.consultRecord}/add`, controller.consultRecord.common.add);
router.all(`${path.consultRecord}/admin-query`, controller.consultRecord.admin.queryCombine);
// router.all(`${path.consultRecord}/update-status`, controller.question.admin.updateStatus);


// Calendar
router.all(`${path.calendar}/query`, controller.calendar.admin.query);
router.all(`${path.calendar}/add`, controller.calendar.admin.add);
router.all(`${path.calendar}/single`, controller.calendar.common.single);

// 匿名问题
router.all(`${path.question}/add`, controller.question.common.add);
router.all(`${path.question}/admin-query`, controller.question.admin.queryCombine);
router.all(`${path.question}/update-status`, controller.question.admin.updateStatus);

// 匿名回答
router.all(`${path.answer}/add`, controller.answer.common.add);
router.all(`${path.answer}/admin-query`, controller.answer.admin.queryCombine);
router.all(`${path.answer}/update-status`, controller.answer.admin.updateStatus);

module.exports = router;