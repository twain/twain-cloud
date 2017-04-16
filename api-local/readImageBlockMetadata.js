'use strict';

module.exports.handler = (event, context, callback) => {

  const body = event.body;

  const response = {
    'kind': 'twainlocalscanner',
    'commandId': body.commandId,
    'method': 'readImageBlockMetadata',
    'results': {
      'success': true,
      'session': {
        'sessionId': 'Session ID created by scanner for this session',
        'revision': 1,
        'state': 'capturing',
      },
      'metadata': {
        'status': {
          'success': true
        },
        'address': {
          'imageNumber': 1,
          'imagePart': 1,
          'moreParts': 'false',
          'sheetNumber': 1,
          'source': 'feederFront',
          'streamName': 'stream0',
          'sourceName': 'source0',
          'pixelFormatName': 'pixelFormat0'
        },
        'image': {
          'compression': 'none',
          'pixelFormat': 'bw1',
          'pixelHeight': 1650,
          'pixelOffsetX': 0,
          'pixelOffsetY': 0,
          'pixelWidth': 1280,
          'resolution': 150,
          'size': 265160
        }
      }
    }
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
