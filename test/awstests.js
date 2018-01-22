'use strict';
require('chai').should();

var aws = require('aws-sdk');
// TODO: move to config
aws.config.update({region: 'us-east-1'});

describe('AWS SDK Tests', function () {
  this.timeout(10000);

  it('Retrieve IOT endpoint for configuration file', function (done) {
    var iot = new aws.Iot();

    iot.describeEndpoint().promise()
    .then((data) => {
      console.log(data);
      data.endpointAddress.should.be.a('string');
      data.endpointAddress.should.not.be.empty;
      done();
    })
    .catch((error) => {
      console.log(error);
      done(error);
    });
  });
});