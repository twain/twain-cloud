'use strict';

const createSession = require('./createSession');
const getSession = require('./getSession');
const sendTask = require('./sendTask');

module.exports.handler = (event, context, callback) => {

  let handler = null;
  const body = event.body;

  switch(body.method) {
  case 'createSession':
    handler = createSession.handler;
    console.log(handler);
    break;
  case 'getSession':
    handler = getSession.handler;
    break;
  case 'sendTask':
    handler = sendTask.handler;
    break;
  case 'startCapturing':
  case 'readImageBlockMetadata':
  case 'readImageBlock':
  case 'releaseImageBlocks':
  case 'stopCapturing':
  case 'closeSession':
  default:
    handler = null;
  }

  if (handler) {
    return handler(event, context, callback);
  } else {
    return callback('Method is not supported');
  }

};
