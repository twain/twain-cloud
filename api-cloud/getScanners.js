'use strict';

const { apiGatewayHandler } = require('../utils/lambda');
const db = require('../utils/dbClient');

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  const clientId = event.principalId;

  env.logger.info('Starting scanner loading...');
  return db.getScanners(clientId, callback);
});
