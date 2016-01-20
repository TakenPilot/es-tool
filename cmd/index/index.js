'use strict';


function cmd(yargs) {
  yargs
    .command('copy', 'Copies index', require('./copy').cmd)
    .command('create', 'Creates index', require('./create').cmd)
    .command('del', 'Creates index', require('./del').cmd)
    .command('replace-with-alias', 'Replace an index with an alias', require('./replace-with-alias').cmd)
    .command('mapping', 'Set of commands to affect mappings', require('./mapping').cmd)
    .command('alias', 'Set of commands to affect mappings', require('./alias').cmd)
    .demand(2);
}

module.exports.cmd = cmd;
module.exports.create = require('./create').op;
module.exports.copy = require('./copy').op;
module.exports.del = require('./del').op;
module.exports.replaceWithAlias = require('./replace-with-alias').op;
module.exports.alias = require('./alias');
module.exports.mapping = require('./mapping');
