'use strict';

const db = require('../utils/dbClient');
const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const sessionId = body.params.sessionId;

  const params = {
    TableName: sessionsTable,
    Key: { 'sessionId': sessionId }
  };

  db.getItem(params).promise().then(data => {
    const session = data.Item;
    callback(null, {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'getSession',
      'results': {
        'success': true,
        'session': session
      }
    });
  }).catch(err => {
    callback({
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'getSession',
      'results': {
        'success': false,
        'session': {
          'sessionId': sessionId,
          'revision': 1,
          'state': 'noSession',
          'imageBlocks': []
        }
      }
    });
  });
};
