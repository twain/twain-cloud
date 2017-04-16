'use strict';

const uuid = require('uuid');
const aws = require('aws-sdk');
const doc = require('dynamodb-doc');

const awsRegion = process.env.ATALA_REGION;
const sessionsTable = process.env.ATALA_SESSIONS_TABLE;

aws.config.update({region: awsRegion});
const dynamo = new doc.DynamoDB();

module.exports.handler = (event, context, callback) => {

  const body = event.body;

  const session = {
    'sessionId': uuid.v4(), // TODO: technically, scanner should generate this
    'revision': 1,
    'state': 'ready',
    'imageBlocks': []
  };

  const params = {
    TableName: sessionsTable,
    Item: session
  };

  dynamo.putItem(params, (err, data) => {
    console.log(err);
    console.log(data);

    const response = {
      'kind': 'twainlocalscanner',
      'commandId': body.commandId,
      'method': 'createSession',
      'results': {
        'success': true,
        'session': session
      }
    };

    callback(null, response);
  });
};
