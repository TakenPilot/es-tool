'use strict';

const stream = require('stream'),
  common = require('../../lib/common'),
  urlParse = require('url'),
  indices = require('./'),
  mapping = require('./mapping'),
  alias = require('./alias'),
  log = require('../../lib/log');

function op(instance, indexName, newIndexName) {
  return mapping.get(instance, indexName).then(function (currentMapping) {
    return indices.create(instance, newIndexName).then(function () {
      return mapping.put(instance, newIndexName, currentMapping);
    });
  }).then(function () {
    return indices.copy(instance, indexName, instance, newIndexName);
  }).then(function () {
    return indices.del(instance, indexName);
  }).then(function () {
    return alias.put(instance, indexName, newIndexName);
  })
}

function cmd(yargs) {
  yargs
    .demand(3);

  const argv = yargs.argv,
    target = urlParse.parse(argv._[2]),
    instance = common.getInstance({
      host: target.protocol + '//' + target.host
    }),
    insetPath = target.path.substr(1),
    splitPath = insetPath.split('/'),
    indexName = splitPath[0],
    newIndexName = indexName + '_v1';

  // get mappings of current index
  op(instance, indexName, newIndexName).then(function () {
    log('info', 'replaced', indexName, 'with alias pointing to', newIndexName);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports.cmd = cmd;
module.exports.op = op;