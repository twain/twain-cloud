'use strict';

const db = require('../utils/dbClient');
const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const sessionId = body.params.sessionId;

  const params = {
    TableName: sessionsTable,
    Key:{
      'sessionId': sessionId,
    }
  };

  db.getItem(params, function(err, data) {
    let response;

    if (err) {
      response = {
        'kind': 'twainlocalscanner',
        'commandId': body.commandId,
        'method': 'getSession',
        'results': {
          'success': false,
          'session': {
            'sessionId': 'Session ID created by scanner for this session',
            'revision': 1,
            'state': 'noSession',
            'imageBlocks': []
          }
        }
      };
    } else {
      response = {
        'kind': 'twainlocalscanner',
        'commandId': body.commandId,
        'method': 'getSession',
        'results': {
          'success': true,
          'session': data
        }
      };
    }

    callback(null, response);
  });
};
