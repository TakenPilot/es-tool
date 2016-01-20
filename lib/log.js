'use strict';

var _ = require('lodash'),
  chalk = require('chalk'),
  path = require('path'),
  winston = require('winston'),
  util = require('util');

// default to console logger, but pretty-print it
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  colorize: true
});

module.exports = winston;
module.exports.withStandardPrefix = function (dirname) {
  const prefix = path.relative(process.cwd(), dirname);

  return function (type) {
    winston.log(type, _.reduce(_.slice(arguments, 1), function (list, value) {
      if (_.isError(value)) {
        list.push(value.stack);
      } else if (_.isObject(value)) {
        list.push(util.inspect(value, {showHidden: true, depth: 10}));
      } else {
        list.push(value + '');
      }

      return list;
    }, [chalk.blue(prefix + '::')]).join(' '));
  };
};
