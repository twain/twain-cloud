'use strict';

const uuid = require('uuid');
const db = require('../utils/dbClient');

const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

module.exports.submit = (event, context, callback) => {
  const scannerInfo = event.body;
  console.log(scannerInfo);

  const scannerId = uuid.v4();
  const registrationToken = uuid.v4();

  scannerInfo.id = scannerId;
  scannerInfo.registrationToken = registrationToken;

  const params = {
    TableName: scannersTable,
    Item: scannerInfo
  };

  db.putItem(params).promise()
  .then(() => {
    const response = {
      registrationToken: registrationToken,
      pollingUrl: '/register?scannerId=' + scannerId,
      inviteUrl: 'https://twain.hazybits.com/register.html?scannerId=' + scannerId
    };

    callback(null, response);
  })
  .catch(callback);
};

module.exports.poll = (event, context, callback) => {
  callback('not implemented');
};

module.exports.claim = (event, context, callback) => {
  
  const claimInfo = event.body;

  var params = {
    Key: {
      'id': {
        S: claimInfo.scannerId
      }
    }, 
    TableName: scannersTable
  };

  db.getItem(params).promise()
  .then(data => {
    if (data.registrationToken === claimInfo.registrationToken) {
      // clear registration token, assign scanner to client
      data.registrationToken = null;

      callback();
    }
  })
  .catch(callback);
};
