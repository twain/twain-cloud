'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');

const cache = require('../api-auth/storage/cacheStorage');
const helpers = require('../api-auth/helpers');
const slsAuth = require('serverless-authentication');

const config = slsAuth.config;
const utils = slsAuth.utils;
const createResponseData = helpers.createResponseData;

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

const apiEndpoint = process.env.TWAIN_API;
const webEndpoint = process.env.TWAIN_WEB;


module.exports.submit = (event, context, callback) => {
  const scannerInfo = event.body;
  console.log(scannerInfo);

  const scannerId = uuid.v4();
  const registrationToken = uuid.v4().substring(0, 8); // Use 8 "random" symbols as registration token

  scannerInfo.id = scannerId;
  scannerInfo.registrationToken = registrationToken;

  const params = {
    TableName: scannersTable,
    Item: scannerInfo
  };

  db.putItem(params).promise()
  .then(() => {
    const queryString = '?scannerId=' + scannerId;

    const response = {
      registrationToken: registrationToken,
      pollingUrl: apiEndpoint + '/poll' + queryString,
      inviteUrl: webEndpoint + '/register/' + queryString
    };

    callback(null, response);
  })
  .catch(callback);
};

module.exports.poll = (event, context, callback) => {

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
      console.log('Nothing was found for provided scannerId: ' + scannerId);
      throw data;
    }

    if (!scanner.clientId) {
      console.log('Scanner is not assigned to a client yet.');
      throw data;
    }

    return cache.saveRefreshToken(scannerId)
    .then(token => {
      const providerConfig = config({ provider: '', stage: event.stage });
      const data = Object.assign(createResponseData(scannerId), { refreshToken: token });
      const authorization_token = utils.createToken(data.authorizationToken.payload, providerConfig.token_secret, data.authorizationToken.options);
      callback(null, { success: true, authorization_token, refresh_token: token });
    });
  })
  .catch(error => {
    console.log(error);
    callback(null, { success: false, message: 'Unknown scanner identifier' });
  });
 
};

module.exports.claim = (event, context, callback) => {
  const clientId = event.principalId;
  const claimInfo = event.body;

  console.log(claimInfo);

  const searchParams = {
    TableName: scannersTable,
    Key: {
      'id': claimInfo.scannerId
    }
  };

  db.getItem(searchParams).promise()
  .then(data => {

    const scanner = data.Item;
    console.log('retrieved scanner: ' + scanner);

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
  .catch(callback);
};
