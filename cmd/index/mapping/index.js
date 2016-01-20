'use strict';

const stream = require('stream'),
  common = require('../../../lib/common'),
  urlParse = require('url');

function cmd(yargs) {
  yargs
    .command('get', 'get mappings', require('./get'))
    .command('put', 'put mappings', require('./put'))
    .demand(3);
}

module.exports = cmd;