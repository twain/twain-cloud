'use strict';

const isOffline = process.env.IS_OFFLINE;

const logger = require('../../utils/logger');
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

const policyContext = (data) => {
  const context = {};
  Object.keys(data).forEach((k) => {
    if (k !== 'id' && ['boolean', 'number', 'string'].indexOf(typeof data[k]) !== -1) {
      context[k] = data[k];
    }
  });
  return context;
};

// Authorize
const authorize = (event, context, callback) => {
  logger.initialize(event, context);

  logger.info('start authorize');
  const stage = event.methodArn.split('/')[1] || 'dev'; // @todo better implementation
  let error = null;
  let policy;
  const authorizationToken = event.authorizationToken;
  if (isOffline) {
    policy = utils.generatePolicy('<offline user>', 'Allow', event.methodArn);
  } else if (authorizationToken) {
    try {
      // this example uses simple expiration time validation
      const providerConfig = config({ provider: '', stage });
      const data = utils.readToken(authorizationToken, providerConfig.token_secret);
      policy = utils.generatePolicy(data.id, 'Allow', event.methodArn);
      policy.context = policyContext(data);
    } catch (err) {
      logger.error(err);
      error = 'Unauthorized';
    }
  } else {
    error = 'Unauthorized';
  }

  logger.debug('auth policy:', JSON.stringify(policy));
  callback(error, policy);
};


exports = module.exports = authorize;
