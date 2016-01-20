'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../../lib/common'),
  fs = require('fs'),
  log = require('../../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function cmd(yargs) {
  var body;

  yargs
    .option('from', {
      alias: 'f',
      demand: true,
      nargs: 1,
      describe: 'file to read mapping from',
      type: 'string'
    })
    .demand(4);

  const argv = yargs.argv,
    target = urlParse.parse(argv._[3]),
    instance = common.getInstance({
      host: target.protocol + '//' + target.host
    }),
    insetPath = target.path.substr(1),
    splitPath = insetPath.split('/'),
    indexName = splitPath[0],
    typeName = splitPath[1],
    options = _.pickBy({index: indexName, type: typeName}, _.identity),
    fileInput = fs.readFileSync(argv.from);

  body = JSON.parse(fileInput);

  if (body[indexName]) {
    body = body[indexName].mappings;
  }

  if (body[typeName]) {
    body = body[typeName];
  }

  log('info', 'putting', options, body);

  instance.indices.putMapping(_.pickBy({index: indexName, type: typeName, body: body}, _.identity)).then(function (result) {
    log('info', result);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports = cmd;