'use strict';

const bluebird = require('bluebird'),
  stream = require('stream'),
  common = require('../../lib/common'),
  urlParse = require('url'),
  log = require('../../lib/log').withStandardPrefix(__dirname);

/**
 *
 * @param {elasticsearch.Client} fromInstance
 * @param {string} fromIndexName
 * @param {elasticsearch.Client} toInstance
 * @param {string} toIndexName
 */
function op(fromInstance, fromIndexName, toInstance, toIndexName) {
  return new bluebird.Promise(function (resolve, reject) {
    const bulkStream = common.createBulkStream(toInstance, 100),
      changeIndexStream = common.createTransformStream(function (obj, encoding, next) {

        obj._index = toIndexName;
        this.push(obj);

        next();
      });

    log('info', 'copying from', fromIndexName, 'to', toIndexName);

    common.streamIndex(fromInstance, fromIndexName, 100)
      .pipe(changeIndexStream)
      .pipe(bulkStream)
      .on('finish', function () {
        resolve();
      });
  });
}

/**
 * @param {yargs} yargs
 */
function cmd(yargs) {
  yargs
    .option('from', {
      alias: 'f',
      demand: true,
      nargs: 1,
      describe: 'pull data from here',
      type: 'string'
    })
    .option('to', {
      alias: 't',
      demand: true,
      nargs: 1,
      describe: 'put data to there',
      type: 'string'
    });

  const argv = yargs.argv,
    to = urlParse.parse(argv.to),
    from = urlParse.parse(argv.from),
    toInstance = common.getInstance({
      host: to.protocol + '//' + to.host
    }),
    fromInstance = common.getInstance({
      host: from.protocol + '//' + from.host
    }),
    fromIndexName = from.path.substr(1),
    toIndexName = to.path.substr(1);

  op(fromInstance, fromIndexName, toInstance, toIndexName);
}

module.exports.cmd = cmd;
module.exports.op = op;