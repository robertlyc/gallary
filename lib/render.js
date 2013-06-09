/*!
 * Re-define `res.render` and more
 * Render a view, which filename is the same as action name
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

var join = require('path').join

module.exports = function(req, res, next) {
  var _render = res.render

  res.render = function() {
    var args = [].slice.call(arguments)
    var view = args[0]

    if (typeof view === 'string') {
      args.shift()

      view = view.indexOf('/') === 0 ? view.slice(1) :
        join(req.namespace, req.controller, view)
    }
    else {
      view = join(req.namespace, req.controller, req.action)
    }

    args.unshift(view)

    // expose e.g. `params.id` in Views
    res.locals.params = extend(
      req.query,
      req.params,
      {
        controller: req.controller,
        action: req.action
      }
    )

    // expose `_csrf` to Views
    if (req.session && req.session._csrf) {
      res.locals._csrf = req.session._csrf
    }

    view === '404' && (res.statusCode = 404)

    _render.apply(res, args)
  }

  next()
}

// helper
function extend() {
  var ret = {}
  var args = [].slice.call(arguments)
  var i

  args.forEach(function(obj) {
    for (i in obj) {
      ret[i] = obj[i]
    }
  })

  return ret
}
