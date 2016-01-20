'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../../lib/common'),
  fs = require('fs'),
  log = require('../../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function op(instance, aliasName) {
  const options = _.pickBy({name: aliasName}, _.identity);

  log('info', 'deleting alias', options);

  instance.indices.deleteAlias(options)
}

function cmd(yargs) {
  yargs
    .demand(4);

  const argv = yargs.argv,
    target = urlParse.parse(argv._[2]),
    instance = common.getInstance({
      host: target.protocol + '//' + target.host
    }),
    insetPath = target.path.substr(1),
    splitPath = insetPath.split('/'),
    aliasName = splitPath[0];

  op(instance, aliasName).then(function (result) {
    log('info', result);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports.cmd = cmd;
module.exports.op = op;
