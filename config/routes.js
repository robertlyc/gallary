/*!
 * Routing mapper
 * please refer to https://github.com/jsw0528/railstyle-router/blob/master/README.md
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

module.exports = function(app) {
  app.resources('projects', { except: 'show, new, edit' })
     .resources('galleries', { except: 'new, edit' })
     .collection({ post: 'sort' })
     .member({ post: 'new_version' })

  app.match('/', 'projects#index')
}
