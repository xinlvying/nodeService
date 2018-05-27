const argv = require('yargs').argv;

// 数据库连接参数
exports.MONGODB = {
  uri: `mongodb://www.sxin.tech:${argv.dbport || '27017'}/reactnative`,
  // uri: `mongodb://localhost:${argv.dbport || '27017'}/reactnative`,
  username: argv.db_username || '',
  password: argv.db_password || ''
}

// 阿里云短信服务ACCESS_KEY_ID/ACCESS_KEY_SECRET
exports.SMSACCESSKEY = {
  accessKeyId: 'LTAIrbtk4IP8sYKo',
  secretAccessKey: 'elHxjpusPFq11amYNDKri8zQA6yGB3',
  signName: '心理之家',
  TemplateCode: 'SMS_133870008'
}

exports.QINIU = {
  accessKey: "yaQDWnibcVH3GRtmYReVzrafk-8deAx1KR_Q5Nz6",
  secretKey: "OYX7QwY4u-LLnEYvHNXyJwFfGFvQXer1CDTA-EA-",
  bucket: "xinlvying",
  // Port: 9000,
  // UptokenUrl: "uptoken",
  // Domain: "ojfweywj8.bkt.clouddn.com"
}

// 用户参数
exports.USER = {
  data: argv.user_data || { user: 'root' },
  jwtTokenSecret: argv.user_key || 'sample_psychology',
  defaultPassword: argv.user_default_password || 'root'
}

// APP运行参数
exports.APP = {
  ROOT_PATH: __dirname,
  LIMIT: 16,
  PORT: 8000
}

exports.INFO = {
  // name: 'NodePress',
  // version: '1.2.0',
  // author: 'Surmon',
  // site: 'https://surmon.me',
  // github: 'https://github.com/surmon-china',
  // powered: ['Vue', 'Nuxt.js', 'React', 'Angular', 'Bootstrap4', 'Nodejs', 'MongoDB', 'Express', 'Nginx']
}