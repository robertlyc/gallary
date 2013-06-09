/*!
 * CSRF
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

module.exports = function(req, res, next) {
  // ignore
  if (req.method === 'GET' || /flash player/i.test(req.get('user-agent'))) {
    return next()
  }

  // generate CSRF token
  var token = req.session._csrf || (req.session._csrf = generateToken(24))

  // check
  if (token !== (req.body._csrf || req.get('x-csrf-token'))) {
    return next(403)
  }

  next()
}

function generateToken(len) {
  return require('crypto').randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64').slice(0, len)
}
