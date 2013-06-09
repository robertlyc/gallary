/*jshint node:true, asi:true, boss:true */
'use strict';

require('railstyle-router')
require('js-yaml')
var express = require('express')
var app = express()
var env = app.get('env')
var root = __dirname + '/'
var appConfig = require(root + 'config/config.yml')[env]

app.configure(function() {
  app.set('controllers', root + 'app/controllers')
  app.set('views', root + 'app/views')
  app.set('view engine', 'jade')
  app.set('app config', appConfig)
  app.disable('x-powered-by')

  app.use(express.favicon(root + 'public/favicon.ico'))
  app.use(express.logger('dev'))
  app.use(express.bodyParser({
    uploadDir: root + 'tmp',
    maxFieldsSize: 10 * 1024 * 1024, // 10M
    keepExtensions: true
  }))
  app.use(express.methodOverride())
  // app.use(express.cookieParser(appConfig.host))
  // app.use(express.cookieSession({
  //   key: appConfig.assets_dir,
  //   cookie: { maxAge: 24 * 60 * 60 * 1000 }
  // }))
  // app.use(require(root + 'lib/csrf'))
  app.use(require('express-validator'))
  app.use(require(root + 'lib/render'))
  app.use(express.static(root + 'public'))

  // connect mongodb
  var db = require('mongoskin').db(appConfig.db, { safe: true })
  console.log('MongoDB connected')
  app.use(function(req, res, next) {
    req.db = db
    next()
  })
})

app.configure('development', function() {
  app.use(express.errorHandler())

  // compile scss when a HTTP request emitted
  var cssPath = 'stylesheets/' + appConfig.assets_dir
  app.set('--sass-dir', root + 'app/assets/' + cssPath)
  app.set('--css-dir', cssPath)
  app.set('--require', root + 'lib/path.rb')
  app.use(require('node-cc'))
})

app.configure('production', function() {
  app.set('release name', require('fs').readFileSync(root + 'RELEASE', 'utf-8').trim())
})

// register helpers on app.locals
require(root + 'app/helpers/application')(app)

// load routes
require(root + 'config/routes')(app)
// 404
app.use(function(req, res) {
  return res.render('/404')
})

app.listen(3000)
console.log('Express server listening on port %d within %s environment.', 3000, env)
