/*!
 * Application Helpers
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

var join = require('path').join

module.exports = function(app) {
  var helper = app.locals
  var appConfig = app.get('app config')
  var onDev = app.get('env') !== 'production'
  var releaseName = app.get('release name')
  var timestamp = function() {
    return '?' + (onDev ? Date.now() : releaseName)
  }
  var toPath = function(prefix, file, other) {
    if (/^(\/|http)/.test(file)) {
      return file
    }
    return prefix + join('/', appConfig.assets_dir, other, file)
  }
  var jsTag = function(code) {
    return '<script>' + code + '</script>'
  }
  var jsIncludeTag = function(file, hasId) {
    var attr = hasId ? ' id="seajsnode"' : ''
    return '<script src="' + file + '"' + attr + '></script>'
  }

  // refer to http://momentjs.com/
  helper.moment = require('moment')

  helper.image_path = function(file) {
    return toPath('/images', file) + timestamp()
  }

  helper.stylesheet_link_tag = function() {
    var files = [].slice.call(arguments)
    var ts = timestamp()
    var str = ''

    files.forEach(function(file) {
      file = toPath('/stylesheets', file)

      if (!/\.css$/.test(file)) {
        file += '.css'
      }

      str += '<link rel="stylesheet" href="' + file + ts + '" />'
    })

    return str
  }

  helper.seajs_and_jquery = function(options) {
    options || (options = {})

    var files = [
      'seajs/' + (options.seajs || '1.3.0') + '/sea.js',
      'seajs-config.js',
      'jquery/' + (options.jquery || '1.8.3') + '/jquery.js'
    ]
    var ts = timestamp()

    if (onDev) {
      return files.map(function(file, i) {
        return jsIncludeTag(
          '/javascripts/modules/' + file + ts,
          i === 0
        )
      }).join('') +
      jsTag('seajs.config({alias: {"$": "' + files[2].slice(0, -3) + '"}})')
    }

    files.splice(1, 1)

    return jsIncludeTag(
      appConfig.js_host + '/modules/??' + files.join(',') + ts + '.js',
      true
    )
  }

  helper.local2web = function() {
    return [].slice.call(arguments).map(function(file) {
      if (/^(\/|#)/.test(file)) {
        return file
      }

      return onDev ? toPath('/javascripts', file, 'src') :
        toPath(appConfig.js_host, file, releaseName)
    })
  }

  helper.seajs_use = function() {
    var files = helper.local2web.apply(helper, arguments).map(function(file) {
      return '"' + file + '"'
    })
    return jsTag('seajs.use([' + files.join(',') + '])')
  }
}
