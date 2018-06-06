'use strict';

const AWS = require('../aws');
const s3 = new AWS.S3({ signatureVersion: 'v4' });
const { apiGatewayHandler } = require('../utils/lambda');

const bucket = process.env.TWAIN_BUCKET;

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  const scannerId = event.path.scannerId;
  const blockId = event.path.blockId;
  const fileId = `${scannerId}/${blockId}`;

  env.logger.info('downloading file');
  const downloadOptions = { Bucket: bucket, Key: fileId };
  s3.getObject(downloadOptions).promise()
  .then(blob => {
    const base64 = blob.Body.toString('base64');
    callback(null, base64);
  })
  .catch(callback);
});