'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');

const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;

  // TODO: add scanner id validation!

  const session = {
    'sessionId': uuid.v4(), // TODO: technically, scanner should generate this
    'revision': 1,
    'state': 'ready',
    'imageBlocks': [],
    '_scannerId': event.path.scannerId
  };

  const params = {
    TableName: sessionsTable,
    Item: session
  };

  db.putItem(params, (err) => {
    if (err) return callback(err);

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
  });
};
