'use strict';

const uuid = require('uuid');

module.exports.handler = (event, context, callback) => {

  callback(null, [
    uuid.v4(),
    uuid.v4()
  ]);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
