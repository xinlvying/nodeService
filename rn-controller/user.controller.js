/*
* 权限控制器
*/

const config = require('../app.config');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');

const User = require('../rn-model/user.model');

const userCtrl = {};

// md5编码
const md5Decode = pwd => {
  return crypto.createHash('md5').update(pwd).digest('hex');
};

// 获取个人信息
userCtrl.GET = (req, res) => {
  User.find({}, '-_id name slogan gravatar')
    .then(([result = {}]) => {
      handleSuccess({ res, result, message: '用户资料获取成功' });
    })
    .catch(err => {
      handleError({ res, err, message: '获取失败' });
    })
};


// 生成登陆口令Token
userCtrl.POST = ({ body: user }, res) => {
  
  const token = jwt.sign({
    data: config.AUTH.data,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
  }, config.AUTH.jwtTokenSecret);


  User.find({}, '-_id password')
    .then(([auth = { password: md5Decode(config.AUTH.defaultPassword) }]) => {
      if (Object.is(md5Decode(password), auth.password)) {
        const token = jwt.sign({
          data: config.AUTH.data,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
        }, config.AUTH.jwtTokenSecret);
        handleSuccess({ res, result: { token }, message: '登陆成功' });
      } else {
        handleError({ res, err, message: '来者何人!' });
      }
    })
    .catch(err => {
      handleError({ res, err, message: '登录失败' });
    })
};

// export
module.exports = (req, res) => { handleRequest({ req, res, controller: userCtrl }) };