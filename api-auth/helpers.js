'use strict';

const redirectUrl = process.env.REDIRECT_CLIENT_URI;

// JWT token options
const createResponseData = (id) => {
  // sets 15 seconds expiration time as an example
  const authorizationToken = {
    payload: {
      id
    },
    options: {
      expiresIn: 3600 // 1 hour
    }
  };

  return { authorizationToken };
};

const redirectProxyCallback = (context, data, origin) => {

  var url = origin ? data.url.replace(redirectUrl, redirectUrl + origin) : data.url;

  context.succeed({
    statusCode: 302,
    headers: {
      Location: url
    }
  });
};

const log = (message) => {
  console.debug(message);
};

exports = module.exports = {
  createResponseData,
  redirectProxyCallback,
  log
};
