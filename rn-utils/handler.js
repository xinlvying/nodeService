/*
*
* 路由统一解析器
*
*/

exports.handleRequest = ({ req, res, controller }) => {
  const method = req.method;
  // console.log(method, controller.method)
  const support = (controller.method == method);
  support && controller.callback(req, res);
  support || res.status(405).jsonp({ code: -1, message: '不支持该请求类型！' });
};

exports.handleError = ({ code, res, err, message = '请求失败' }) => {
  // console.log(err);

  if (code && code > 0) {
    res.status(code).jsonp({ code: -1, message, debug: err });
  } else {
    res.jsonp({ code: -1, message, debug: err });
  }
};

exports.handleSuccess = ({ res, message = '请求成功', data = null }) => {
  res.json({ code: 0, message, data });
};

exports.handleThrottle = (method, delay) => {
  let canRun = true;
  return () => {
    if (canRun) {
      canRun = false;
      method();
      setTimeout(function () {
        canRun = true;
      }, delay);
    }
  }
};
