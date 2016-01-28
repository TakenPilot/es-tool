'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  elastic = require('elasticsearch'),
  log = require('./log').withStandardPrefix(__dirname),
  stream = require('stream'),
  yargs = require('yargs');

function getInstance(options) {
  const argv = yargs.argv;

  if (!options.apiVersion && argv['api-version']) {
    options.apiVersion = argv['api-version'].toString();
  }

  // change from 1.7 to 2.0
  if (options.host) {
    options.endpoint = options.host;
  }

  log('info', 'connecting to', options);

  return new elastic.Client(_.assign(_.cloneDeep(options), {
    maxSockets: 500,
    sniffOnStart: false,
    defer: function () { return bluebird.defer(); }
  }));
}

/**
 * Scroll through a large number of elasticsearch results
 * @param {object} instance
 * @param {string} name
 * @returns {function}
 */
function scrollResults(instance, name) {
  var scrollPersistenceInterval = yargs.scroll || '30m',
    buffer = [],
    initialScrollId,curScrollId, scrollIds = [],
    stream,
    sum = 0,
    initialized = false,
    scrollFinished = false,
    search_type = 'scan' //default = 'query_then_fetch', option is 'scan'

  function init() {
    log('info', 'Initializing with scrollId', curScrollId);
    initialized = true;
    initialScrollId = curScrollId;
    var promise;
    promise = instance.scroll({scrollId: curScrollId, scroll: scrollPersistenceInterval})
    promise.then(onResult).catch(onError);
  }

  function end() {
    stream.push(null);
    if (search_type != 'scan') {
      scrollIds.forEach(function(id){
        log('info', 'closing stream with scrollId,', id, ', pushed', sum);
        instance.clearScroll({scrollId: id}).catch(function (error) {
          log('error', 'clearScroll', error);
        });
      })  
    }
  }

  function push() {
    stream.push(buffer.shift());
    sum++;
  }

  function onResult(result) {
    var results = result.hits.hits,
      fetched = results.length;

    scrollFinished = (curScrollId == result['_scroll_id']);
    curScrollId = result['_scroll_id'];
    scrollIds.push(curScrollId);

    log('info','fetched', fetched, 'scrollFinished', scrollFinished, ' scrollId',curScrollId);
    log('info', 'initialized', initialized);

    if (initialized == false) { 
      init();
    } else {
      log('info', 'fetched', fetched, 'from', name, 'sum:', sum);

      // add extra to the front of results
      if (!scrollFinished && fetched) {
        buffer = buffer.concat(results);
        push();
      } else {
        end();
      }
    }

    log('info','all done')
  }

  function onError(error) {
    log('error','oops');
    if (error.status) {
      if (error.status === 429) {
        return log('error', error.displayName, error.message);
      } else if (error.status === 503) {
        return log('error', error.displayName, error.message);
      }
    }

    log('error', 'search', error);
  }

  // read function
  return function(num) {
    var promise;

    stream = this;

    if (buffer.length) {
      //log('info', 'clearing buffer ')
      push();
    } else {
      if (curScrollId) {

        // this num is not correct since scroll is (num x shards)
        log('info', 'scrolling', num);
        promise = instance.scroll({scrollId: curScrollId, scroll: scrollPersistenceInterval})
      } else {
        log('info', 'starting search');
        promise = instance.search({search_type:search_type, index: name, scroll: scrollPersistenceInterval, size: num})
      }
      promise.then(onResult).catch(onError);
    }
  };
}

/**
 * Returns every entry in the index
 * @param {object} instance
 * @param {string} name  Name of the index
 * @param {number} [highWaterMark]
 * @returns {Promise}
 */
function streamIndex(instance, name, highWaterMark) {
  highWaterMark = highWaterMark || 100;
  const Readable = stream.Readable,
    result = Readable({
      objectMode: true, // elastic returns objects
      highWaterMark: highWaterMark,
      read: scrollResults(instance, name)
    });

  result.on('error', function (error) {
    log('error', 'streamIndex', error);
  });

  return result;
}

function createBulkStream(instance, highWaterMark) {
  var buffer = [];
  highWaterMark = highWaterMark || 100;

  function send(items, cb) {
    const ops = _.reduce(items, function (ops, item) {

      // action description
      ops.push({index: {_index: item._index, _type: item._type, _id: item._id}});
      // the document to index
      ops.push(item._source);

      return ops;
    }, []);

    instance.bulk({
      body: ops
    }, function (err,data) {
      if (err) {
        log('error in bulk call: ', err)
      }
      log('info', 'sending', _.map(items, '_id'));
      cb();
    });
  }

  const Writable = stream.Writable,
    result = Writable({
      objectMode: true,
      highWaterMark: highWaterMark,
      write: function (object, encoding, cb) {
        buffer.push(object);
        if (buffer.length >= highWaterMark) {
          send(buffer, cb);
          buffer = [];
        } else {
          cb();
        }
      }
    });

  /**
   * @see http://elegantcode.com/2013/10/14/detecting-the-end-of-a-rainbow-inside-a-writable-stream/
   */
  result.on('finish', function () {
    send(buffer, _.noop);
  });

  result.on('error', function (error) {
    log('error', 'createBulkStream', error);
  });

  return result;
}

/**
 * @param transform
 * @param [flush]
 * @returns {stream.Transform}
 */
function createTransformStream(transform, flush) {
  var Transform = stream.Transform,
    result = new Transform(_.pickBy({
      objectMode: true,
      transform: transform,
      flush: flush
    }, _.identity));

  result.on('error', function (error) {
    log('error', 'createTransformStream', error);
  });

  return result;
}



module.exports.getInstance = getInstance;
module.exports.createTransformStream = createTransformStream;
module.exports.streamIndex = streamIndex;
module.exports.createBulkStream = createBulkStream;
