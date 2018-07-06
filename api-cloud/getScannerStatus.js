'use strict';

const { apiGatewayHandler } = require('../utils/lambda');
const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  let scannerId = event.path.scannerId;

  return db.getScannerById(scannerId)
    .then(scanner => {
      // generate signed MQTT Url
      return iot.signMqttUrl(context)
      // create session object
        .then(iotUrl => {
          const deviceSession = {
            type: 'mqtt',
            url: iotUrl,
            requestTopic: iot.getDeviceRequestTopic(scannerId),
            responseTopic: iot.getDeviceResponseTopic(scanner.clientId)
          };

          return callback(null, deviceSession);
        });
    })
    .catch(err => {
      env.logger.error(err);
      callback(err);
    });
});