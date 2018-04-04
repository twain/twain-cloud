'use strict';

const AWS = require('../aws');
const db = require('../utils/dbClient');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const bucket = process.env.TWAIN_BUCKET;
const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const sessionId = body.params.sessionId;
  const blockNumber = body.params.imageBlockNum;

  const params = {
    TableName: sessionsTable,
    Key: { 'sessionId': sessionId }
  };

  db.getItem(params).promise().then(data => {
    const session = data.Item;
    const fileId = session.imageBlocks[blockNumber];
    const downloadOptions = { Bucket: bucket, Key: fileId };
    return s3.getObject(downloadOptions).promise();
  }).then(function (blob) {
    const base64 = blob.Body.toString('base64');

    callback(null, {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'readImageBlock',
      'results': {
        'success': true,
        'session': {
          'sessionId': 'Session ID created by scanner for this session',
          'revision': 1,
          'state': 'capturing'
        },
        'block': base64
      }
    });
  }).catch(callback);
};
