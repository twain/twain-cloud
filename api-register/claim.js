'use strict';

const db = require('../utils/dbClient');
const { apiGatewayHandler } = require('../utils/lambda');

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  const clientId = event.principalId;
  const claimInfo = event.body;

  env.logger.debug(claimInfo);

  const searchParams = {
    TableName: scannersTable,
    Key: {
      'id': claimInfo.scannerId
    }
  };

  db.getItem(searchParams).promise()
  .then(data => {

    const scanner = data.Item;
    env.logger.info('retrieved scanner: ' + scanner);

    if (scanner.registrationToken === claimInfo.registrationToken) {
      const updateParams = {
        TableName: scannersTable,
        Key: {
          'id': claimInfo.scannerId
        },
        UpdateExpression: 'SET clientId = :clientId REMOVE registrationToken',
        ExpressionAttributeValues: { 
          ':clientId': clientId 
        },
        ReturnValues: 'ALL_NEW'
      };
      
      return db.updateItem(updateParams).promise()
      .then(data => {
        callback(null, data.Attributes);
      });
    }
    else {
      callback('invalid scanner id: ' + claimInfo.scannerId);
    }
  })
  .catch(err => {
    env.logger.error(err);
    callback(err);
  });
});
