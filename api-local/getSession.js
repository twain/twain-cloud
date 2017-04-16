'use strict';

module.exports.handler = (event, context, callback) => {

  const body = event.body;

  const response = {
    'kind': 'twainlocalscanner',
    'commandId': body.commandId,
    'method': 'getSession',
    'results': {
      'success': true,
      'session': {
        'sessionId': 'Session ID created by scanner for this session',
        'revision': 1,
        'state': 'ready',
        'imageBlocks': []
      }
    }
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
