'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');

const cache = require('../api-auth/storage/cacheStorage');
const helpers = require('../api-auth/helpers');
const slsAuth = require('serverless-authentication');
const { apiGatewayHandler } = require('../utils/lambda');

const config = slsAuth.config;
const utils = slsAuth.utils;
const createResponseData = helpers.createResponseData;

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

const apiEndpoint = process.env.TWAIN_API;
const webEndpoint = process.env.TWAIN_WEB;


module.exports.submit = apiGatewayHandler((event, context, callback, env) => {

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

module.exports.poll = apiGatewayHandler((event, context, callback, env) => {
  const scannerId = event.query.scannerId;

  if (!scannerId) {
    callback('Missing scannerId query parameter.');
  }
  
  const searchParams = {
    TableName: scannersTable,
    Key: {
      'id': scannerId
    }
  };

  db.getItem(searchParams).promise()
  .then(data => {
    const scanner = data.Item;

    if (!scanner) {
      env.logger.warning('Nothing was found for provided scannerId: ' + scannerId);
      throw data;
    }

    if (!scanner.clientId) {
      env.logger.warning('Scanner is not assigned to a client yet.');
      throw data;
    }

    return cache.saveRefreshToken(scannerId)
    .then(token => {
      const providerConfig = config({ provider: '', stage: event.stage });
      const data = Object.assign(createResponseData(scannerId), { refreshToken: token });
      const authorizationToken = utils.createToken(data.authorizationToken.payload, providerConfig.token_secret, data.authorizationToken.options);
      callback(null, { success: true, authorizationToken, refreshToken: token });
    });
  })
  .catch(error => {
    env.logger.error(error);
    callback(null, { success: false, message: 'Unknown scanner identifier' });
  });
 
});

module.exports.claim = apiGatewayHandler((event, context, callback, env) => {
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
