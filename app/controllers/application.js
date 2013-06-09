/*!
 * Application Controller
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

exports.uploadImages = function(req, res, next) {
  var fs = require('fs')
  var path = require('path')
  var mkdirp = require('mkdirp')
  var moment = req.app.locals.moment

  var filedata = req.files.Filedata
  var imagePath = path.join(
    '/uploads',
    moment(new Date()).format('YYYY/MM/DD'),
    path.basename(filedata.path)
  )

  // 批量创建文件夹，并将上传的图片移进来
  var target = path.join(path.dirname(filedata.path), '../public', imagePath)
  mkdirp(path.dirname(target), function() {
    fs.rename(filedata.path, target)
  })

  req.uploadedImage = {
    name: path.basename(filedata.name, path.extname(filedata.name)),
    path: imagePath
  }

  next()
}
