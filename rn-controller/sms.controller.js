/*
* 短信验证码控制器
*/

const SMSClient = require('@alicloud/sms-sdk')

const config = require('../app.config');

const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const generateCheckCode = require('../rn-utils/checkcode.generator');

const User = require('../rn-model/user.model');

const smsCtrl = {};

const accessKeyId = config.SMSACCESSKEY.accessKeyId;

const secretAccessKey = config.SMSACCESSKEY.secretAccessKey;

// 获取短信验证码
smsCtrl.POST = ({ body: { phone } }, res) => {
  // 生成6位验证码
  const code = generateCheckCode(6);

  const templateParam = JSON.stringify({ code: code });

  //初始化sms_client
  let smsClient = new SMSClient({ accessKeyId, secretAccessKey });

  //发送短信
  smsClient.sendSMS({
    PhoneNumbers: phone,
    SignName: config.SMSACCESSKEY.signName,
    TemplateCode: config.SMSACCESSKEY.TemplateCode,
    TemplateParam: templateParam
  }).then(function (res) {
    let { Code } = res
    if (Code === 'OK') {
      //处理返回参数
      console.log(res)
    }
  }, function (err) {
    console.log(err)
  });
}

module.exports = (req, res) => { handleRequest({ req, res, controller: smsCtrl }) };