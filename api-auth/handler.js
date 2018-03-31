'use strict';

const signinHandler = require('./handlers/signinHandler');
const callbackHandler = require('./handlers/callbackHandler');
const refreshHandler = require('./handlers/refreshHandler');
const authorizeHandler = require('./handlers/authorizeHandler');

module.exports.signin =
  (event, context) =>
    signinHandler(event, context);

module.exports.callback =
  (event, context) =>
    callbackHandler(event, context);

module.exports.refresh =
  (event, context, cb) =>
    refreshHandler(event, context, cb);

module.exports.authorize =
  (event, context, cb) =>
    authorizeHandler(event, context, cb);

