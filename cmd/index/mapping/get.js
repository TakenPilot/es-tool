'use strict';

const _ = require('lodash'),
  stream = require('stream'),
  common = require('../../../lib/common'),
  fs = require('fs'),
  log = require('../../../lib/log').withStandardPrefix(__dirname),
  urlParse = require('url');

function cmd(yargs) {
  yargs
    .option('output', {
      alias: 'o',
      demand: false,
      nargs: 1,
      describe: 'write file to this location',
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
    options = _.pickBy({index: indexName, type: typeName}, _.identity);

  log('info', 'getting', options);

  instance.indices.getMapping(_.pickBy({index: indexName, type: typeName}, _.identity)).then(function (result) {

    if (result[indexName]) {
      result = result[indexName].mappings;
    }

    if (result[typeName]) {
      result = result[typeName];
    }

    if (argv.output) {
      log('info', 'writing to', argv.output);
      fs.writeFileSync(argv.output, JSON.stringify(result), {encoding: 'utf8'});
    } else {
      log('info', result);
    }
  }).catch(function (error) {
    log('error', error);
  });
}

module.exports = cmd;