'use strict';

const { apiGatewayHandler } = require('../utils/lambda');

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  env.logger.info(event);
  env.logger.info(context);

  // TODO: we don't use this handler at the moment. Remove?

  return callback(null, null);
});