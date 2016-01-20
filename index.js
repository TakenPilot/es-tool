'use strict';
var yargs = require('yargs');

yargs.usage('Usage: $0 [command]')
  .wrap(Math.min(160))
  .option('api-version', {
    demand: false,
    nargs: 1,
    describe: 'version of api to use',
    type: 'string'
  })
  .command('index', 'Set of commands to affect indices', require('./cmd/index'))
  .help('h')
  .version(function () {
    return require('./package.json').version;
  })
  .alias('h', 'help')
  .demand(1);

yargs.help();