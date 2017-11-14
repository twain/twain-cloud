'use strict';
const iot = require('../utils/iotClient');

module.exports.handler = (event, context, callback) => {
  const body = event.body;
  const scannerId = event.path.scannerId;

  iot.notifyScanner(scannerId, { command: 'stopCapturing' }).then(() => {
    const response = {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'stopCapturing',
      'results': {
        'success': true,
        'session': {
          'sessionId': 'Session ID created by scanner for this session',
          'revision': 1,
          'state': 'ready'
        }
      }
    };

    callback(null, response);
  }).catch(callback);
};
