'use strict';

function initializeEnvironment(event, context, logger) {
  logger.initialize(event, context);
  logger.info('Starting execution...');
}

module.exports = {
  initializeEnvironment
};

