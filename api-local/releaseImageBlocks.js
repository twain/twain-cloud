'use strict';

const AWS = require('../aws');
const db = require('../utils/dbClient');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const bucket = process.env.TWAIN_BUCKET;
const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;

module.exports.handler = (event, context, callback) => {

  const body = event.body;
  const sessionId = body.params.sessionId;
  const startBlockIndex = body.params.imageBlockNum;
  const endBlockIndex = body.params.lastImageBlockNum || startBlockIndex;

  const params = {
    TableName: sessionsTable,
    Key: { 'sessionId': sessionId }
  };

  db.getItem(params).promise().then(data => {
    const session = data.Item;
    return session.imageBlocks;
  }).then(imageBlocks => {
    const blocksToDelete = [];
    for (let i = startBlockIndex; i <= endBlockIndex; ++i) {
      blocksToDelete.push({
        Key: imageBlocks[i]
      });
    }

    return s3.deleteObjects({ Bucket: bucket, Delete: { Objects: blocksToDelete } }).promise();
  })
  // .then(() => {
  //   const updateParams = {
  //     TableName: sessionsTable,
  //     Key:{ 'sessionId': sessionId },
  //     UpdateExpression: 'SET imageBlocks = :blocks',
  //     ExpressionAttributeValues:{ ':blocks': [] }
  //   };
  //   db.updateItem(updateParams).promise();
  // })
    .then(() => {
      callback(null, {
        'kind': 'twainlocalscanner',
        'commandId': body.commandId,
        'method': 'releaseImageBlocks',
        'results': {
          'success': true,
          'session': {
            'sessionId': 'Session ID created by scanner for this session',
            'revision': 1,
            'state': 'capturing',
            'imageBlocks': []
          }
        }
      });
    }).catch(callback);
};
