'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');

const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const clientId = event.principalId;
  const scannerId = event.path.scannerId;
  const sessionId = uuid.v4(); // TODO: technically, scanner should generate this
  // TODO: add scanner id validation!

  // generate signed MQTT Url
  iot.signMqttUrl(context)
  // create session object 
  .then(iotUrl => {
    const session = {
      sessionId: sessionId,
      revision: 1,
      state: 'ready',
      imageBlocks: [],
      eventSource: {
        type: 'mqtt',
        url: iotUrl,
        topic: iot.getClientTopic(sessionId)
      },
      _scannerId: scannerId,
      _clientId: clientId
    };

    return session;
  })
  .then(session => {
    const params = {
      TableName: sessionsTable,
      Item: session
    };
    
    return db.putItem(params).promise()
    .then(() => {
      return iot.notifyScanner(scannerId, { 
        command: 'createSession', 
        parameters: { 
          sessionId: sessionId 
        } 
      });
    })
    .then(() => {
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
  })
  .catch(callback);
};
