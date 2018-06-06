'use strict';

const { apiGatewayHandler } = require('../utils/lambda');
const db = require('../utils/dbClient');

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  // TODO: add condition with user id to prevent unauthorized delete
  const scannerId = event.path.scannerId;

  db.deleteScanner(scannerId)
  .then(() => { callback(null, null); })
  .catch(err => {
    env.logger.error(err);
    callback(err);
  });
});