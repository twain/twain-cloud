'use strict';

const { apiGatewayHandler } = require('../utils/lambda');
const iot = require('../utils/iotClient');

function getClientId(request) {
  return request.principalId;
}

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {

  let clientId = getClientId(event);
  env.logger.info(`Loading user information and environment details scanners for clientId: ${clientId}`);

  // generate signed MQTT Url
  return iot.signMqttUrl(context)
  // create session object 
  .then(iotUrl => {
    const clientEnvironment = {
      eventBroker: {
        type: 'mqtt',
        url: iotUrl,
        topic: iot.getClientTopic(clientId),
      }
    };

    return callback(null, clientEnvironment);
  })
  .catch(err => {
    env.logger.error(err);
    callback(err);
  });
});