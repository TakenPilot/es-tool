'use strict';

const common = require('../../../lib/common');

function cmd(yargs) {
  yargs
    .command('put', 'get alias', require('./put').cmd)
    .command('del', 'put alias', require('./del').cmd)
    .command('get', 'get alias', require('./get').cmd)
    .demand(3);
}

module.exports.cmd = cmd;
module.exports.put = require('./put').op;
module.exports.del = require('./del').op;
module.exports.get = require('./get').op;