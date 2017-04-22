'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');

const scannersTable = process.env.ATALA_SCANNERS_TABLE;

module.exports.getScanners = (event, context, callback) => {

  const params = {
    TableName: scannersTable
  };

  let scanners = [];

  db.scan(params, function onScan(err, data) {
    if (err) return callback(err);

    scanners = scanners.concat(data.Items);

    // continue scanning if we have more movies, because
    // scan can retrieve a maximum of 1MB of data
    if (typeof data.LastEvaluatedKey != 'undefined') {
      console.log('Scanning for more...');
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      db.scan(params, onScan);
    } else {
      // return found scanners to the client
      callback(null, scanners);
    }
  });
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
