'use strict';

const { apiGatewayHandler } = require('../utils/lambda');
const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

function getClientId(request) {
  return request.principalId;
}

module.exports.getScanners = apiGatewayHandler((event, context, callback, env) => {
  let params = {
    TableName: scannersTable
  };

  let clientId = getClientId(event);
  if (clientId){
    params = Object.assign(params, {
      FilterExpression : 'clientId = :clientId',
      ExpressionAttributeValues : {':clientId' : clientId}
    });
  }

  let scanners = [];

  env.logger.info(`Loading scanners for clientId: ${clientId}`);
  db.scan(params, function onScan(err, data) {
    if (err) return callback(err);

    scanners = scanners.concat(data.Items);

    // continue scanning if we have more movies, because
    // scan can retrieve a maximum of 1MB of data
    if (typeof data.LastEvaluatedKey !== 'undefined') {
      env.logger.debug('Scanning for more...');
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      db.scan(params, onScan);
    } else {
      // return found scanners to the client
      callback(null, scanners);
    }
  });
});

module.exports.getScannerStatus = apiGatewayHandler((event, context, callback, env) => {
  // TODO: compare with scannerId passed in URL
  let scannerId = getClientId(event);

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

module.exports.deleteScanner = apiGatewayHandler((event, context, callback, env) => {
  // TODO: add condition with user id to prevent unauthorized delete
  const scannerId = event.path.scannerId;
  const params = {
    TableName: scannersTable,
    Key:{
      'id': scannerId
    }
  };

  env.logger.info(`Deleting scanner with id: ${scannerId}`);
  db.deleteItem(params, callback);
});