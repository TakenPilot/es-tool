'use strict';

const stream = require('stream'),
  common = require('../../lib/common'),
  urlParse = require('url');

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
    bulkStream = common.createBulkStream(toInstance, 100),
    changeIndexStream = common.createTransformStream(function (obj, encoding, next) {

      obj._index = to.path.substr(1);
      this.push(obj);

      next();
    });

  common.streamIndex(fromInstance, from.path.substr(1), 100)
    .pipe(changeIndexStream)
    .pipe(bulkStream)
}

module.exports = cmd;