const AWS = require('aws-sdk');
const iotEndpoint = process.env.TWAIN_IOT_ENDPOINT;

this._iotData = new AWS.IotData({ endpoint: iotEndpoint });

module.exports.notifyScanner = function (scannerId, message) {
  let stringMessage = JSON.stringify(message);
  const params = { topic: `twain/scanners/${scannerId}/fromCloud`, payload: stringMessage, qos: 0 };
  return this._iotData.publish(params).promise();
};

module.exports.notifySesssion = function (sessionId, message) {
  let stringMessage = JSON.stringify(message);
  const params = { topic: `twain/sessions/${sessionId}/fromCloud`, payload: stringMessage, qos: 0 };
  return this._iotData.publish(params).promise();
};