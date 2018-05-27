/**
 * API路由
 */

const bodyParser = require('body-parser');
const config = require('../../app.config');
const apiForApp = require('./app.routes');
const apiForAdmin = require('./admin.routes');

const routes = app => {

  // 公共拦截器
  app.all('*', (req, res, next) => {

    // production env
    const isProduction = Object.is(process.env.NODE_ENV, 'production');

    // Set Header
    const allowedOrigins = ['http://sxin.tech', 'https://admin.sxin.tech', 'http://localhost:8085'];
    const origin = (req.headers.origin || '');
    if (!isProduction) {
      allowedOrigins.push(origin);
    };
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    };
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With');
    res.header('Access-Control-Allow-Methods', 'PUT,PATCH,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Max-Age', '1728000');
    res.header('Content-Type', 'application/json;charset=utf-8');
    res.header('X-Powered-By', 'nodeService 1.0.0');

    // OPTIONS
    if (req.method == 'OPTIONS') {
      res.sendStatus(200);
      return false;
    };

    // 如果是生产环境，需要验证用户来源渠道，防止非正常请求
    if (isProduction) {
      const { origin, referer } = req.headers;
      const originVerified = (!origin || origin.includes('sxin.tech')) &&
        (!referer || referer.includes('sxin.tech'))
      if (!originVerified) {
        res.status(403).jsonp({ code: 0, message: '来者何人！' })
        return false;
      };
    };

    // 排除auth的post请求 && 评论的post请求 && like请求
    // const isLike = Object.is(req.url, '/like') && Object.is(req.method, 'POST');
    // const isPostAuth = Object.is(req.url, '/auth') && Object.is(req.method, 'POST');
    // const isPostComment = Object.is(req.url, '/comment') && Object.is(req.method, 'POST');
    // if (isLike || isPostAuth || isPostComment) {
    // 	next();
    // 	return false;
    // };

    // 拦截所有非管理员的非get请求
    // if (!authIsVerified(req) && !Object.is(req.method, 'GET')) {
    //   res.status(401).jsonp({ code: 0, message: '来者何人！' })
    //   return false;
    // };

    next();
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));

  // Api
  app.get('/api', (req, res) => {
    res.jsonp(config.INFO);
  });

  app.use('/api/app/v1', apiForApp);
  app.use('/api/admin/v1', apiForAdmin);

  // 404
  app.all('*', (req, res) => {
    res.status(404).jsonp({
      code: -1,
      message: '无效请求'
    })
  });
}

module.exports = routes;