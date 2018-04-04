'use strict';

const iot = require('../utils/iotClient');

module.exports.handler = (event, context, callback) => {
  const body = event.body;
  const scannerId = event.path.scannerId;

  iot.notifyScanner(scannerId, { command: 'startCapturing' }).then(() => {
    const response = {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'startCapturing',
      'results': {
        'success': true,
        'session': {
          'sessionId': 'Session ID created by scanner for this session',
          'revision': 1,
          'state': 'capturing'
        }
      }
    };

    callback(null, response);
  }).catch(callback);
};
