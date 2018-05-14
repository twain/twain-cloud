'use strict';

const db = require('../utils/dbClient');
const cache = require('../api-auth/storage/cacheStorage');
const { apiGatewayHandler } = require('../utils/lambda');
const helpers = require('../api-auth/helpers');
const slsAuth = require('serverless-authentication');

const config = slsAuth.config;
const utils = slsAuth.utils;
const createResponseData = helpers.createResponseData;

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
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