'use strict';

const createSession = require('./createSession');
const getSession = require('./getSession');
const sendTask = require('./sendTask');
const startCapturing = require('./startCapturing');
const readImageBlockMetadata = require('./readImageBlockMetadata');
const readImageBlock = require('./readImageBlock');
const releaseImageBlocks = require('./releaseImageBlocks');
const stopCapturing = require('./stopCapturing');
const closeSession = require('./closeSession');

module.exports.handler = (event, context, callback) => {
  console.log(event);

  let handler = null;
  const body = event.body;

  switch (body.method) {
  case 'createSession':
    handler = createSession.handler;
    break;
  case 'getSession':
    handler = getSession.handler;
    break;
  case 'sendTask':
    handler = sendTask.handler;
    break;
  case 'startCapturing':
    handler = startCapturing.handler;
    break;
  case 'readImageBlockMetadata':
    handler = readImageBlockMetadata.handler;
    break;
  case 'readImageBlock':
    handler = readImageBlock.handler;
    break;
  case 'releaseImageBlocks':
    handler = releaseImageBlocks.handler;
    break;
  case 'stopCapturing':
    handler = stopCapturing.handler;
    break;
  case 'closeSession':
    handler = closeSession.handler;
    break;
  }

  if (handler) {
    return handler(event, context, callback);
  } else {
    return callback('Method is not supported');
  }
};