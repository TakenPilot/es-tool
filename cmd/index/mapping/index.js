'use strict';

const common = require('../../../lib/common');

function cmd(yargs) {
  yargs
    .command('get', 'get mappings', require('./get').cmd)
    .command('put', 'put mappings', require('./put').cmd)
    .command('delete', 'put mappings', require('./put').cmd)
    .demand(3);
}

module.exports.cmd = cmd;
module.exports.get = require('./get').op;
module.exports.put = require('./put').op;
module.exports.del = require('./del').op;
