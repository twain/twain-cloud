'use strict';

const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');
const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const scannerId = event.path.scannerId;
  const sessionId = body.params.sessionId;

  iot.notifyScanner(scannerId, { command: 'closeSession' }).then(() => {
    const params = {
      TableName: sessionsTable,
      Key: { 'sessionId': sessionId }
    };

    return db.deleteItem(params).promise();
  }).then(() => {
    const response = {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'closeSession',
      'results': {
        'success': true,
        'session': {
          'sessionId': 'Session ID created by scanner for this session',
          'revision': 1,
          'state': 'closed'
        }
      }
    };

    callback(null, response);
  }).catch(callback);
};
