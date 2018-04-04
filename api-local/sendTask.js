'use strict';

const iot = require('../utils/iotClient');

module.exports.handler = (event, context, callback) => {
  const body = event.body;
  const scannerId = event.path.scannerId;
  const task = body.params.task;

  iot.notifyScanner(scannerId, { command: 'sendTask', parameters: { task: JSON.stringify(task) } }).then(() => {
    callback(null, {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'sendTask',
      'results': {
        'success': true,
        'session': {
          'sessionId': 'Session ID created by scanner for this session',
          'revision': 1,
          'state': 'ready',
          'task': '{ TWAIN Direct task reply }'
        }
      }
    });
  }).catch(callback);
};
