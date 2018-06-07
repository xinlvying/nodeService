/*
* 短信验证码控制器
*/

const SMSClient = require('@alicloud/sms-sdk')

const config = require('../app.config');

const Controller = require('../rn-utils/controller.generator');
const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const generateCheckCode = require('../rn-utils/checkcode.generator');

const User = require('../rn-model/user.model');
const Sms = require('../rn-model/sms.record.model');

const smsCtrl = {
  app: {},
  admin: {}
};

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
          resolve(res);
        }
      }, function (err) {
        reject(err);
      });
  });
}

// 获取短信验证码
smsCtrl.app.getSmsCode = new Controller({
  method: 'POST',
  callback: ({ body: { login_phone } }, res) => {

    // 生成6位验证码
    const code = generateCheckCode(6);
    // console.log(login_phone, code);

    function newSmsRecord(login_phone, code) {
      return new Promise((resolve, reject) => {
        new Sms({ login_phone, sms_code: code }).save()
          .then(result => {
            // console.log(result);
            resolve(result);
          })
          .catch(err => {
            // // console.log(err);
            reject(err);
          })
      });
    }

    async function handleSendAndSaveSms(login_phone, code) {
      const sendResult = await handleSendSms(login_phone, code);
      const saveResult = await newSmsRecord(login_phone, code);
      // console.log(sendResult);
    }

    handleSendAndSaveSms(login_phone, code)
      .then(respond => {
        handleSuccess({ res, data: respond, message: '短信获取成功' });
      })
      .catch(err => {
        handleError({ res, err, message: '短信获取失败' });
      })
  }
});

smsCtrl.app.login = new Controller({
  method: 'POST',
  callback: ({ body: { login_phone, sms_code } }, res) => {

    // 校验短信验证码
    function checkSmsCode(login_phone, sms_code) {
      return new Promise((resolve, reject) => {
        const promise = Sms.find({ login_phone }, { sms_code: 1 }).sort({ create_at: -1 }).limit(1).exec();
        promise.then(res => {
          if (res[0].sms_code == sms_code) resolve();
          else reject('短信验证码错误');
        }).catch(err => {
          reject(err);
        });
      });
    }

    // 注册保存用户
    function registerUser(login_phone) {
      return new Promise((resolve, reject) => {
        const promise = User.find({ login_phone }).exec();
        promise.then(res => {
          if (res.length) resolve(res[0]);
          else {
            new User({ login_phone }).save()
              .then(result => {
                resolve(result);
              })
              .catch(err => {
                reject(err);
              })
          }
        }).catch(err => {
          reject(err);
        });
      })
    }

    async function handleUserLogin(login_phone, sms_code) {
      let [checkResult, user] = await Promise.all([checkSmsCode(login_phone, sms_code), registerUser(login_phone)]);
      return user;
    }

    handleUserLogin(login_phone, sms_code)
      .then((user) => {
        handleSuccess({ res, data: user, message: '登录成功' });
      })
      .catch(err => {
        // console.log(err)
        handleError({ res, err, message: '登录失败' });
      })
  }
});

exports.app = {
  getSmsCode: (req, res) => { handleRequest({ req, res, controller: smsCtrl.app.getSmsCode }) },
  login: (req, res) => { handleRequest({ req, res, controller: smsCtrl.app.login }) }
}