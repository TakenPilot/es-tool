'use strict';


function cmd(yargs) {
  yargs
    .command('copy', 'Copies index', require('./copy'))
    .command('create', 'Creates index', require('./create'))
    .command('mapping', 'Set of commands to affect mappings', require('./mapping'))
    .demand(2);
}

module.exports = cmd;