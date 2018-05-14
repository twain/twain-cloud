'use strict';

const uuid = require('uuid');
const AWS = require('../aws');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const bucket = process.env.TWAIN_BUCKET;

module.exports.handler = (event, context, callback) => {
  const scannerId = event.path.scannerId;
  const blockId = uuid.v4();

  const fileId = `${scannerId}/${blockId}`;
  const uploadOptions = { Bucket: bucket, Key: fileId, Body: new Buffer(event.body, 'base64') };

  console.log('saving file');
  s3.putObject(uploadOptions).promise()
  .then(() => {
    callback(null, blockId);
  })
  .catch(callback);
};