'use strict';

module.exports.handler = (event, context, callback) => {

  const body = {
    'version': '1.0',
    'name': 'Manufacturer’s description of the scanner',
    'description': 'User’s description of the scanner',
    'url': '',
    'type': 'twaindirect',
    'id': '',
    'device_state': 'idle',
    'connection_state': 'offline',
    'manufacturer': 'Manufacturer’s Name',
    'model': '',
    'serial_number': '',
    'firmware': '',
    'uptime': '',
    'setup_url': '',
    'support_url': '',
    'update_url': '',
    'x-privet-token': event.path.scannerId, // TODO: scanner should supply the token
    'api': [
      '/privet/twaindirect/session'
    ],
    'semantic_state': ''
  };

  callback(null, body);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
