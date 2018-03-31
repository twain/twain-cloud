'use strict';

const urljoin = require('url-join');
const redirectUrl = process.env.TWAIN_WEB;

// JWT token options
const createResponseData = (id) => {
  
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

const redirectProxyCallback = (context, data, origin, query) => {

  var url = data.url;

  if (origin) {
    url = url.replace(redirectUrl, urljoin(redirectUrl, origin));
  }

  if (query) {
    url = url + '&' + decodeURIComponent(query);
  }
  
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
