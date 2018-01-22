const AWS = require('aws-sdk');
var signUrl = require('aws-device-gateway-signed-url');

const iotEndpoint = process.env.TWAIN_IOT_ENDPOINT;
this._iotData = new AWS.IotData({ endpoint: iotEndpoint });

// Get random Int
function getRandomInt() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

module.exports.signMqttUrl = function signMqttUrl(context) {
  const roleName = process.env.TWAIN_IOT_ROLE;
  const accountId = context.invokedFunctionArn.match(/\d{3,}/)[0];

  const params = {
    RoleArn: `arn:aws:iam::${accountId}:role/${roleName}`,
    RoleSessionName: getRandomInt().toString()
  };

  // assume role returns temporary keys
  const sts = new AWS.STS();
  return sts.assumeRole(params).promise()
  .then(role => {
    var signedUrl = signUrl({
      regionName: process.env.REGION,
      endpoint: iotEndpoint,
      accessKey: role.Credentials.AccessKeyId,
      secretKey: role.Credentials.SecretAccessKey,
      sessionToken: role.Credentials.SessionToken
    });
    return signedUrl;
  });
};

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

// TODO: remove duplication
module.exports.getClientTopic = function (sessionId) {
  return `twain/sessions/${sessionId}/fromCloud`;
}