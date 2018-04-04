'use strict';

const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');
const { apiGatewayHandler } = require('../utils/lambda');

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

module.exports.handler = apiGatewayHandler((event, context, callback, env) => {
  const scannerId = event.scannerId;
  const sessionId = event.sessionId;

  var processTask = Promise.resolve();
  switch (event.event) {
  case 'deviceStatusChanged':
    processTask = updateScannerState(scannerId, event.status);
    break;
  case 'imageBlockReady':
    processTask = addImageBlock(sessionId, event.blockId);
    break;
  }

  processTask
  .then(() => {
    return iot.notifySesssion(sessionId, event);
  })
  .then(() => {
    callback();
  })
  .catch(err => {
    env.logger.error(err);
    callback(err);
  });
});