'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');
const { apiGatewayHandler } = require('../utils/lambda');

const apiEndpoint = process.env.TWAIN_API;
const webEndpoint = process.env.TWAIN_WEB;
const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {

  const scannerInfo = event.body;
  env.logger.debug(scannerInfo);

  const scannerId = uuid.v4();
  const registrationToken = uuid.v4().substring(0, 8); // Use 8 "random" symbols as registration token

  scannerInfo.id = scannerId;
  scannerInfo.registrationToken = registrationToken;

  const params = {
    TableName: scannersTable,
    Item: scannerInfo
  };

  env.logger.info(`Persisting scanner with id: ${scannerId} and registration token: ${registrationToken}`);
  db.putItem(params).promise()
  .then(() => {
    const queryString = '?scannerId=' + scannerId;

    const response = {
      scannerId: scannerId,
      registrationToken: registrationToken,
      pollingUrl: apiEndpoint + '/poll' + queryString,
      inviteUrl: webEndpoint + '/register/' + queryString
    };

    callback(null, response);
  })
  .catch(callback);
});