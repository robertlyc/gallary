/*!
 * Projects Controller
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

exports.index = function(req, res) {
  req.db.collection('projects').findItems({}, {
    limit: 100,
    sort: [['_id', -1]]
  },
  function(err, docs) {
    res.render({ title: 'Projects List', projects: docs })
  })
}

exports.create = function(req, res) {
  var moment = req.app.locals.moment

  req.sanitize('name').entityEncode()

  req.db.collection('projects').insert({
    name: req.body.name,
    gallery: []
  },
  function(err, doc) {
    doc = doc.pop()
    doc.created_at = moment(doc._id.getTimestamp()).format('YYYY-MM-DD HH:mm')
    res.json(doc)
  })
}

exports.update = function(req, res) {
  req.sanitize('name').entityEncode()

  req.db.collection('projects').updateById(req.params.id, {
    $set: {
      name: req.body.name
    }
  }, { safe: false })

  res.send(200)
}

// 删除项目，以及所属 gallery 和 comment
exports.destroy = function(req, res) {
  req.db.collection('projects').removeById(req.params.id, { safe: false })
  req.db.collection('galleries').remove({ project_id: req.params.id }, { safe: false })

  res.send(200)
}
