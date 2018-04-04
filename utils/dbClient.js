'use strict';

const aws = require('../aws');
const doc = require('dynamodb-doc');

const awsRegion = process.env.REGION;

aws.config.update({region: awsRegion});
const dynamo = new doc.DynamoDB();

module.exports = dynamo;