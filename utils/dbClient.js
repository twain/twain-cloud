'use strict';

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

const aws = require('../aws');
const doc = require('dynamodb-doc');
const logger = require('./logger');

const awsRegion = process.env.REGION;
aws.config.update({region: awsRegion});
const dynamo = new doc.DynamoDB();

module.exports = dynamo;

// TODO: replace with promise / async
module.exports.getScanners = function(clientId, callback) {
  let params = {
    TableName: scannersTable
  };

  if (clientId){
    params = Object.assign(params, {
      FilterExpression : 'clientId = :clientId',
      ExpressionAttributeValues : {':clientId' : clientId}
    });
  }

  let scanners = [];

  logger.info(`Loading scanners for clientId: ${clientId}`);
  dynamo.scan(params, function onScan(err, data) {
    if (err) return callback(err);

    scanners = scanners.concat(data.Items);

    // continue scanning if we have more movies, because
    // scan can retrieve a maximum of 1MB of data
    if (typeof data.LastEvaluatedKey !== 'undefined') {
      logger.debug('Scanning for more...');
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      dynamo.scan(params, onScan);
    } else {
      // return found scanners to the client
      callback(null, scanners);
    }
  });
};

module.exports.getScannerById = function(scannerId) {
  const searchParams = {
    TableName: scannersTable,
    Key: { 'id': scannerId }
  };

  logger.info(`Getting scanner with id: ${scannerId}`);
  return dynamo.getItem(searchParams).promise()
  .then(data => {
    const scanner = data.Item;

    if (!scanner) {
      throw new Error('No scanner with specified ID');
    }

    return scanner;
  });
};

module.exports.deleteScanner = function(scannerId) {

  const params = {
    TableName: scannersTable,
    Key:{ 'id': scannerId }
  };

  logger.info(`Deleting scanner with id: ${scannerId}`);
  return dynamo.deleteItem(params).promise();
};