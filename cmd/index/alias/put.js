'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../../lib/common'),
  fs = require('fs'),
  log = require('../../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function op(instance, aliasName, indexName) {
  const options = _.pickBy({name: aliasName, index: indexName}, _.identity);

  log('info', 'putting alias', options);

  return instance.indices.putAlias(options);
}

function cmd(yargs) {
  yargs
    .option('index', {
      demand: true,
      nargs: 1,
      describe: 'index that the alias should point to',
      type: 'string'
    })
    .demand(4);

  const argv = yargs.argv,
    target = urlParse.parse(argv._[2]),
    instance = common.getInstance({
      host: target.protocol + '//' + target.host
    }),
    insetPath = target.path.substr(1),
    splitPath = insetPath.split('/'),
    aliasName = splitPath[0];

  op(instance, aliasName, argv.index).then(function (result) {
    log('info', result);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports.cmd = cmd;
module.exports.op = op;