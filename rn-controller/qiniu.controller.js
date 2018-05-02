/*
*
* 阿里oss控制器
*
*/

// const OSS = require('ali-oss');
const Controller = require('../rn-utils/controller.generator');

const { handleRequest, handleError, handleSuccess } = require('../rn-utils/handler');
const config = require('../app.config');
const formidable = require('formidable');
const util = require('util');

let uploadCtrl = {};

// 获取配置列表
uploadCtrl.upload = new Controller({
  method: 'POST',
  callback: (req, res) => {
    let form = new formidable.IncomingForm();
    let url = '';
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = "./public/img";
    form.on('fileBegin', (name, file) => {
      if (file.type.indexOf('image') == -1) {
        handleError({ res, message: '请上传图片类型文件' });
        return false;
      } else url = process.env.NODE_ENV == 'dev' ? `http://localhost:${config.APP.PORT}${file.path.substring(6)}` : `http:sxin.tech${file.path.substring(6)}`;;
    })

    form.parse(req, function (err, fields, files) {
      if (err) {
        handleError({ res, message: '上传失败', err });
        return false;
      } else res.send({ errno: 0, data: [url], message: '上传成功', code: 0 });

    });
  }
})

module.exports = (req, res) => { handleRequest({ req, res, controller: uploadCtrl.upload }) };
