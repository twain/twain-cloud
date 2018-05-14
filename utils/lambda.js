'use strict';
const logger = require('./logger');

function apiGatewayHandler(handler) {
  return (event, context, callback) => {
    logger.initialize(event, context);
    logger.scope('Request Scope', () => {
      return handler(event, context, callback, { logger });
    });
  };
}

module.exports = {
  apiGatewayHandler
};

