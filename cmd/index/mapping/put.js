'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../../lib/common'),
  fs = require('fs'),
  log = require('../../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function op(instance, mapping, indexName, typeName) {
  var options;

  if (_.isString(mapping)) {
    mapping = JSON.parse(mapping);
  }

  if (mapping[indexName]) {
    mapping = mapping[indexName].mappings;
  }

  if (mapping[typeName]) {
    mapping = mapping[typeName];
  }

  if (indexName && !typeName && _.size(mapping) === 1) {
    typeName = Object.keys(mapping)[0];
    mapping = mapping[typeName];
  }

  options = _.pickBy({index: indexName, type: typeName, body: mapping}, _.identity);

  log('info', 'putting mapping', options);

  return instance.indices.putMapping(options);
}

function cmd(yargs) {
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
    fileInput = fs.readFileSync(argv.from);

  op(instance, fileInput, indexName, typeName).then(function (result) {
    log('info', result);
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports.cmd = cmd;
module.exports.op = op;
