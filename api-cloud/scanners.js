'use strict';

// TEST 
const AWS = require('aws-sdk');
var signUrl = require('aws-device-gateway-signed-url');

const uuid = require('uuid');
const db = require('../utils/dbClient');

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;


// Get random Int
const getRandomInt = () => {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

function signIotWssEndpoint(context, callback) {

  var accountId = context.invokedFunctionArn.match(/\d{3,}/)[0];
  var roleName = process.env.TWAIN_IOT_ROLE;

  const params = {
    RoleArn: `arn:aws:iam::${accountId}:role/${roleName}`,
    RoleSessionName: getRandomInt().toString()
  };

  // assume role returns temporary keys
  const sts = new AWS.STS();
  sts.assumeRole(params, (err, data) => {
    if (err) return callback(err);

    var signedUrl = signUrl ({
      regionName: process.env.REGION,
      endpoint: process.env.TWAIN_IOT_ENDPOINT,
      accessKey: data.Credentials.AccessKeyId,
      secretKey: data.Credentials.SecretAccessKey,
      sessionToken: data.Credentials.SessionToken
    });

    return callback(null, signedUrl);
  });
}

module.exports.getScanners = (event, context, callback) => {

  signIotWssEndpoint(context, callback);

  // let params = {
  //   TableName: scannersTable
  // };

  // let apiKey = getClientId(event);
  // if (apiKey){
  //   params = Object.assign(params, {
  //     FilterExpression : 'clientId = :clientId',
  //     ExpressionAttributeValues : {':clientId' : apiKey}
  //   });
  // }

  // let scanners = [];

  // db.scan(params, function onScan(err, data) {
  //   if (err) return callback(err);

  //   scanners = scanners.concat(data.Items);

  //   // continue scanning if we have more movies, because
  //   // scan can retrieve a maximum of 1MB of data
  //   if (typeof data.LastEvaluatedKey !== 'undefined') {
  //     console.log('Scanning for more...');
  //     params.ExclusiveStartKey = data.LastEvaluatedKey;
  //     db.scan(params, onScan);
  //   } else {
  //     // return found scanners to the client
  //     callback(null, scanners);
  //   }
  // });
};

module.exports.loginScanner = (event, context, callback) => {
  const scannerInfo = event.body;
  console.log(scannerInfo);

  // generate x-privet-token to authenticate furhter requests
  scannerInfo['x-privet-token'] = uuid.v4();
  scannerInfo.url = `/scanners/${scannerInfo.id}`;
  scannerInfo.api = [
    `/scanners/${scannerInfo.id}/privet/info`,
    `/scanners/${scannerInfo.id}/privet/twaindirect/session`
  ];

  let apiKey = getClientId(event);
  if (apiKey) {
    scannerInfo.clientId = apiKey;
  }

  const params = {
    TableName: scannersTable,
    Item: scannerInfo
  };

  db.putItem(params, (err, data) => {
    if (err) return callback(err);
    callback(null, data);
  });
};


module.exports.logoffScanner = (event, context, callback) => {
  const scannerId = event.path.scannerId;

  const params = {
    TableName: scannersTable,
    Key:{
      'id': scannerId
    }
  };

  db.deleteItem(params, function(err, data) {
    if (err) return callback(err);

    callback(null, data);
  });
};

function getClientId(request) {
  return request.headers['x-api-key'];
}