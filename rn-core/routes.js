/*
*
* 路由模块
*
*/

const config = require('../app.config');

const controller = require('../rn-controller');
// const authIsVerified = require('np-utils/np-auth');

const routes = app => {

  // 拦截器
  app.all('*', (req, res, next) => {

    // production env
    // const isProduction = Object.is(process.env.NODE_ENV, 'production');

    // Set Header
    // const allowedOrigins = ['https://surmon.me', 'https://admin.surmon.me'];
    // const origin = req.headers.origin || '';
    // if (!isProduction) {
    // 	allowedOrigins.push(origin);
    // };
    // if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // };
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With');
    res.header('Access-Control-Allow-Methods', 'PUT,PATCH,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Max-Age', '1728000');
    res.header('Content-Type', 'application/json;charset=utf-8');
    res.header('X-Powered-By', 'Nodepress 1.0.0');

    // OPTIONS
    if (req.method == 'OPTIONS') {
      res.sendStatus(200);
      return false;
    };

    // 如果是生产环境，需要验证用户来源渠道，防止非正常请求
    // if (isProduction) {
    // 	const { origin, referer } = req.headers;
    // 	const originVerified = (!origin	|| origin.includes('surmon.me')) && 
    // 												 (!referer || referer.includes('surmon.me'))
    // 	if (!originVerified) {
    // 		res.status(403).jsonp({ code: 0, message: '来者何人！' })
    // 		return false;
    // 	};
    // };

    // 排除auth的post请求 && 评论的post请求 && like请求
    // const isLike = Object.is(req.url, '/like') && Object.is(req.method, 'POST');
    // const isPostAuth = Object.is(req.url, '/auth') && Object.is(req.method, 'POST');
    // const isPostComment = Object.is(req.url, '/comment') && Object.is(req.method, 'POST');
    // if (isLike || isPostAuth || isPostComment) {
    // 	next();
    // 	return false;
    // };

    // 拦截所有非管路员的非get请求
    // if (!authIsVerified(req) && !Object.is(req.method, 'GET')) {
    // 	res.status(401).jsonp({ code: 0, message: '来者何人！' })
    // 	return false;
    // };

    next();
  });

  // Api
  app.get('/', (req, res) => {
    res.jsonp(config.INFO);
  });

  // // Auth
  // app.all('/auth', controller.auth);

  // // 七牛Token
  // app.all('/qiniu', controller.qiniu);

  // // 全局option
  // app.all('/option', controller.option);

  // // like
  // app.post('/like', controller.like);

  // Category
  app.all('/category', controller.category.list);
  app.all('/category/:category_id', controller.category.item);

  // Article
  app.all('/article', controller.article.list);
  app.all('/article/:article_id', controller.article.item);

  // announcement
  // app.all('/announcement', controller.announcement.list);
  // app.all('/announcement/:announcement_id', controller.announcement.item);

  // 404
  app.all('*', (req, res) => {
    res.status(404).jsonp({
      code: 0,
      message: '无效的API请求'
    })
  });
};

module.exports = routes;