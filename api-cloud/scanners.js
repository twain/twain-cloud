'use strict';

const { initializeEnvironment } = require('../utils/lambda');
const logger = require('../utils/logger');
const uuid = require('uuid');
const db = require('../utils/dbClient');

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

module.exports.getScanners = (event, context, callback) => {
  initializeEnvironment(event, context, logger);
  
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

  logger.info(`Loading scanners for clientId: ${clientId}`);
  db.scan(params, function onScan(err, data) {
    if (err) return callback(err);

    scanners = scanners.concat(data.Items);

    // continue scanning if we have more movies, because
    // scan can retrieve a maximum of 1MB of data
    if (typeof data.LastEvaluatedKey !== 'undefined') {
      console.log('Scanning for more...');
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      db.scan(params, onScan);
    } else {
      // return found scanners to the client
      callback(null, scanners);
    }
  });
};

module.exports.loginScanner = (event, context, callback) => {
  const scannerInfo = event.body;
  console.log(scannerInfo);

  // generate x-privet-token to authenticate further requests
  scannerInfo['x-privet-token'] = uuid.v4();
  scannerInfo.url = `/scanners/${scannerInfo.id}`;
  scannerInfo.api = [
    `/scanners/${scannerInfo.id}/privet/info`,
    `/scanners/${scannerInfo.id}/privet/twaindirect/session`
  ];

  let apiKey = getClientId(event);
  if (apiKey) {
    scannerInfo.clientId = apiKey;
  }

  const params = {
    TableName: scannersTable,
    Item: scannerInfo
  };

  db.putItem(params, (err, data) => {
    if (err) return callback(err);
    callback(null, data);
  });
};

module.exports.deleteScanner = (event, context, callback) => {
  initializeEnvironment(event, context, logger);

  // TODO: add condition with user id to prevent unauthorized delete
  const scannerId = event.path.scannerId;
  const params = {
    TableName: scannersTable,
    Key:{
      'id': scannerId
    }
  };

  logger.info(`Deleting scanner with id: ${scannerId}`);
  db.deleteItem(params, callback);
};

function getClientId(request) {
  return request.principalId;
}