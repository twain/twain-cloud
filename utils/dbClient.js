'use strict';

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

const aws = require('../aws');
const doc = require('dynamodb-doc');

const awsRegion = process.env.REGION;
aws.config.update({region: awsRegion});
const dynamo = new doc.DynamoDB();

module.exports = dynamo;


module.exports.getScannerById = function(scannerId) {
  const searchParams = {
    TableName: scannersTable,
    Key: {
      'id': scannerId
    }
  };

  return dynamo.getItem(searchParams).promise()
  .then(data => {
    const scanner = data.Item;

    if (!scanner) {
      throw new Error('No scanner with specified ID');
    }

    return scanner;
  });
};