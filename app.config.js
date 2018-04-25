const argv = require('yargs').argv;

exports.MONGODB = {
  uri: `mongodb://www.sxin.tech:${argv.dbport || '27017'}/reactnative`,
  username: argv.db_username || '',
  password: argv.db_password || ''
}

console.log(argv)

exports.APP = {
  ROOT_PATH: __dirname,
  LIMIT: 16,
  PORT: 8000
}

exports.INFO = {
  name: 'NodePress',
  version: '1.2.0',
  author: 'Surmon',
  site: 'https://surmon.me',
  github: 'https://github.com/surmon-china',
  powered: ['Vue', 'Nuxt.js', 'React', 'Angular', 'Bootstrap4', 'Nodejs', 'MongoDB', 'Express', 'Nginx']
}