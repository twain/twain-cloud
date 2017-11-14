'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');

const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const scannerId = event.path.scannerId;
  const sessionId = uuid.v4(); // TODO: technically, scanner should generate this

  // TODO: add scanner id validation!

  const session = {
    'sessionId': sessionId,
    'revision': 1,
    'state': 'ready',
    'imageBlocks': [],
    '_scannerId': scannerId
  };

  const params = {
    TableName: sessionsTable,
    Item: session
  };

  db.putItem(params).promise().then(() => {
    return iot.notifyScanner(scannerId, { command: 'createSession', parameters: { sessionId: sessionId } });
  }).then(() => {
    const response = {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'createSession',
      'results': {
        'success': true,
        'session': session
      }
    };

    callback(null, response);
  }).catch(callback);
};
