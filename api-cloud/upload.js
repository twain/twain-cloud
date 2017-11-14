'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const bucket = process.env.TWAIN_BUCKET;

module.exports.handler = (event, context, callback) => {
  const folder = event.path.scannerId;
  const fileId = `${folder}/${uuid.v4()}`;
  const uploadOptions = { Bucket: bucket, Key: fileId, Body: new Buffer(event.body, 'base64') };

  console.log('saving file');

  s3.putObject(uploadOptions, function (err) {
    if (err) return callback(err);
    callback(null, fileId);
  });
};