'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../lib/common'),
  fs = require('fs'),
  log = require('../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function op(instance, indexName) {
  const options = _.pickBy({index: indexName}, _.identity);

  log('info', 'deleting index', options);

  return instance.indices.delete(options);
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
    indexName = splitPath[0];

  op(instance, indexName).then(function (result) {
    log('info', result);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports.cmd = cmd;
module.exports.op = op;