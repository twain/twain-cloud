'use strict';

const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');
const sessionsTable = process.env.TWAIN_SESSIONS_TABLE;
const scannersTable = process.env.TWAIN_SCANNERS_TABLE;

function updateScannerState(scannerId, state) {
  const params = {
    TableName: scannersTable,
    Key: { 'id': scannerId },
    UpdateExpression: 'SET connection_state = :state',
    ExpressionAttributeValues: { ':state': state }
  };

  return db.updateItem(params).promise();
}

function addImageBlock(sessionId, blockId) {
  const params = {
    TableName: sessionsTable,
    Key: { 'sessionId': sessionId },
    UpdateExpression: 'SET imageBlocks = list_append(imageBlocks, :block)',
    ExpressionAttributeValues: { ':block': [blockId] }
  };

  return db.updateItem(params).promise();
}

module.exports.handler = (event, context, callback) => {
  console.log(event);

  const scannerId = event.scannerId;
  const sessionId = event.sessionId;

  switch (event.event) {
  case 'deviceStatusChanged':
    updateScannerState(scannerId, event.status).then(function () {
      // TODO: notify client
      iot.notifySesssion(sessionId, event);
    });
    break;
  case 'imageBlockReady':
    addImageBlock(sessionId, event.blockId).then(function () {
      // TODO: notify client
      iot.notifySesssion(sessionId, event);
    });
  }

  callback(null, {});
};