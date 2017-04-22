'use strict';

const aws = require('aws-sdk');
const doc = require('dynamodb-doc');

const awsRegion = process.env.ATALA_REGION;

aws.config.update({region: awsRegion});
const dynamo = new doc.DynamoDB();

module.exports = dynamo;