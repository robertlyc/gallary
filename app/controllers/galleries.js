/*!
 * Galleries Controller
 */

/*jshint node:true, asi:true, boss:true */
'use strict';

exports.before_filter = {
  'create, new_version': require('./application').uploadImages
}

exports.index = function(req, res) {
  req.db.collection('projects').findById(req.params.project_id, function(err, doc) {
    if (!doc) {
      return res.render('/404')
    }

    var locals = { title: doc.name, gallery: [] }
    var gallery = doc.gallery

    if (!gallery.length) {
      res.render(locals)
      return
    }

    req.db.collection('galleries').findItems({
      _id: {
        $in: gallery.map(function(item) { return req.db.ObjectID(item) })
      }
    },
    function(err, docs) {
      locals.gallery = docs.sort(function(x, y) {
        return gallery.indexOf(y._id.toString()) - gallery.indexOf(x._id.toString())
      })
      res.render(locals)
    })
  })
}

exports.show = function(req, res) {
  req.db.collection('galleries').findById(req.params.id, function(err, doc) {
    if (!doc) {
      return res.render('/404')
    }

    res.render(doc)
  })
}

exports.create = function(req, res) {
  req.db.collection('galleries').insert({
    title: req.uploadedImage.name,
    project_id: req.params.project_id,
    versions: [].concat(req.uploadedImage.path)
  },
  function(err, doc) {
    doc = doc.pop()

    req.db.collection('projects').updateById(req.params.project_id, {
      $push: {
        gallery: doc._id.toString()
      }
    },
    function() {
      res.json(doc)
    })
  })
}

exports.update = function(req, res) {
  req.sanitize('title').entityEncode()

  req.db.collection('galleries').updateById(req.params.id, {
    $set: {
      title: req.body.title
    }
  }, { safe: false })

  res.send(200)
}

// 删除所有版本及评论
exports.destroy = function(req, res) {
  req.db.collection('galleries').removeById(req.params.id, { safe: false })
  req.db.collection('projects').updateById(req.params.project_id, {
    $pull: {
      gallery: req.params.id
    }
  }, { safe: false })

  res.send(200)
}

exports.sort = function(req, res) {
  req.db.collection('projects').updateById(req.params.project_id, {
    $set: {
      gallery: req.body.sort.reverse()
    }
  }, { safe: false })

  res.send(200)
}

exports.new_version = function(req, res) {
  req.db.collection('galleries').updateById(req.params.id, {
    $push: {
      versions: req.uploadedImage.path
    }
  }, { safe: false })

  res.send(req.uploadedImage.path)
}
