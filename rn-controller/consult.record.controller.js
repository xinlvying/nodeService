/**
 * 咨询记录控制器
 */

const SMSClient = require('@alicloud/sms-sdk')
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

const accessKeyId = config.SMSACCESSKEY.accessKeyId;

const secretAccessKey = config.SMSACCESSKEY.secretAccessKey;

// 发送短信
function handleSendSms(phone, code) {
  return new Promise((resolve, reject) => {
    const templateParam = JSON.stringify({ code: code });

    //初始化sms_client
    let smsClient = new SMSClient({ accessKeyId, secretAccessKey });

    //发送短信
    smsClient.sendSMS({
      PhoneNumbers: phone,
      SignName: config.SMSACCESSKEY.signName,
      TemplateCode: config.SMSACCESSKEY.TemplateCode,
      TemplateParam: templateParam
    })
      .then(function (res) {
        let { Code } = res
        if (Code === 'OK') {
          //处理返回参数
          // // console.log(res);
          resolve(res);
        }
      }, function (err) {
        // // console.log(err);
        reject(err);
      });
  });
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

consultantRecord.admin.queryByDate = new Controller({
  method: 'GET',
  callback: ({ params: { consult_date } }, res) => {
    let date;
    if (consult_date) date = new Date(consult_date);
    else handleError({ res, message: '参数不能为空' });
    // 请求

    const promise = ConsultantRecord.find({ 'consult_date': date }).exec();
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
    // console.log(consultantRecord);
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
    let consult_week = consultantRecord.consult_week;

    ConsultantRecord.find({ visitor_tel, consultant_id, consult_time, consult_week })
      .then(consultantRecord => {
        // console.log(consultantRecord);

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
      populate: ['consultant_id'],
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

consultantRecord.admin.updateStatus = new Controller({
  method: 'PATCH',
  callback: ({ body: { id, status } }, res) => {

    // 验证
    if (!id) {
      handleError({ res, message: '缺少有效参数' });
      return false;
    };

    let querys = { 'id': id };
    let options = { new: true };

    const promise = ConsultantRecord.findOneAndUpdate(querys, { $set: { status } }).exec();
    promise.then(data => {
      console.log(data);
      handleSuccess({ res, data, message: '操作成功' });
    }).catch(err => {
      console.log(err);
      handleError({ res, err, message: '操作失败' });
    })
  }
});

exports.admin = {
  queryCombine: (req, res) => { handleRequest({ req, res, controller: consultantRecord.admin.queryCombine }) },
  updateStatus: (req, res) => { handleRequest({ req, res, controller: consultantRecord.admin.updateStatus }) },
  queryByDate: (req, res) => { handleRequest({ req, res, controller: consultantRecord.admin.queryByDate }) }
}
exports.common = {
  add: (req, res) => { handleRequest({ req, res, controller: consultantRecord.common.add }) }
}
