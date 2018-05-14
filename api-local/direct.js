'use strict';
const REGION = process.env.REGION;
const iot = require('../utils/iotClient');
const { apiGatewayHandler } = require('../utils/lambda');

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  env.logger.info(event);

  const body = event.body;
  const method = event.method;
  const headers = event.headers;
  const scannerId = event.path.scannerId;
  const resourcePath = event.resourcePath;

  var template = 'https://{apiId}.execute-api.{region}.amazonaws.com/{stage}' + resourcePath;
  var url = template
    .replace('{apiId}', event.apiId)
    .replace('{region}', REGION)
    .replace('{stage}', event.stage)
    .replace('{scannerId}', event.path.scannerId);

  // TODO: check scanner is online

  return iot.notifyScanner(scannerId, { 
    headers,
    method, 
    url,
    body: JSON.stringify(body)
  })
  .then(() => { callback(null, {}); })
  .catch(callback);
});