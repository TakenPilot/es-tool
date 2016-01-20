'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../../lib/common'),
  fs = require('fs'),
  log = require('../../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function op(instance, indexName, typeName) {
  const options = _.pickBy({index: indexName, type: typeName}, _.identity);

  log('info', 'deleting mapping', options);

  return instance.indices.deleteMapping(options)
}

function cmd(yargs) {
  yargs
    .demand(4);

  const argv = yargs.argv,
    target = urlParse.parse(argv._[3]),
    instance = common.getInstance({
      host: target.protocol + '//' + target.host
    }),
    insetPath = target.path.substr(1),
    splitPath = insetPath.split('/'),
    indexName = splitPath[0],
    typeName = splitPath[1];

  op(instance, indexName, typeName).then(function (result) {
    log('info', result);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports.cmd = cmd;
module.exports.op = op;