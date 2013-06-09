/*jshint node:true, asi:true, boss:true */
'use strict';

var cluster = require('cluster')
var numCPUs = require('os').cpus().length
var i = 0

cluster.setupMaster({ exec: __dirname + '/app.js' })

for (; i < numCPUs; i++) {
  cluster.fork()
}

cluster.on('exit', function(worker) {
  console.log('Worker ' + worker.process.pid + ' died. Restarting...')
  cluster.fork()
})
