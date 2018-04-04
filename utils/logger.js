'use strict';

const util = require('util');
const processLogLevel = 5;
const stage = process.env.STAGE;

const logLevels = {
  off: 0,
  critical: 1,
  error: 2,
  warn: 3,
  info: 4,
  debug: 5
};

/**
 * Simple logger that should be used for all diagnostic messages.
 * @param context
 * @constructor
 */
function Logger() {
  var me = this;
  function createLogger(level) {
    const loggerLevel = logLevels[level];

    return function () {
      // log only what is necessary
      if (loggerLevel <= processLogLevel) {
        const entry = {
          message: {
            Message: util.format.apply(null, arguments),
            level: loggerLevel,
            props: {
              awsRegion: me.awsRegion,
              awsAccountId: me.awsAccountId
            }
          },
          context: {
            env: `twain-cloud-${me.stage}`,
            requestId: me.apiRequestId,
            requestPath: me.path,
            userId: me.principalId,
            lambdaId: me.lambdaId
          },
          timestamp: new Date().toISOString() // ISO string is always in UTC
        };

        console.log(JSON.stringify(entry));
      }
    };
  }

  /**
   * Reinitializes the logger with provided context.
   */
  this.initialize = function(event, context) {

    me.stage = stage;
    me.path = event.path;

    if (event && event.requestContext) {
      me.principalId = event.requestContext.principalId; 
      me.apiRequestId = event.requestContext.requestId;
    }
  
    if (context && context.invokedFunctionArn) {
      // Lambda ARN has the following structure:
      // arn:partition:service:region:account-id:function:lambda-name
      var arn = context.invokedFunctionArn.split(':');
  
      // 3th ARN component (region)
      me.awsRegion = arn[3];
      // 4th ARN component (account-id)
      me.awsAccountId = arn[4];
      // 6th ARN component (lambda-name)
      me.lambdaId = arn[6];
    }
  };
  
  /**
   * Writes error message to the log.
   */
  this.critical = createLogger('critical');

  /**
   * Writes error message to the log.
   */
  this.error = createLogger('error');
  /**
   * Writes warning message to the log.
   */
  this.warn = createLogger('warn');
  /**
   * Writes info message to the log.
   */
  this.info = createLogger('info');
  /**
   * Writes debug message to the log.
   */
  this.debug = createLogger('debug');
  /**
   * Measures execution time of provided lambda and writes
   * this information to the log.
   * @returns {*}
   */
  this.scope = function () {
    const args = Array.prototype.slice.call(arguments);
    const body = args.pop();
    const start = process.hrtime();
    const me = this;

    const isPromise = function(obj) {
      return obj && (typeof obj.then == 'function');
    };

    const stopTimer = function() {
      const end = process.hrtime(start);
      const ms = end[1] / 1000000; // divide by a million to get nano to milli

      const scopeName = util.format.apply(null, args);
      me.info.apply(null, [{
        scope: scopeName,
        duration: `${end[0]}s, ${ms.toFixed(3)}ms` // s.ms
      }]);
    };

    var result;
    try {
      result = isPromise(body) ? body : body();
    } finally {
      if (isPromise(result)) {
        // wrap the result promise to record execution time
        result = result
          .catch(err => {
            stopTimer();
            throw err;
          })
          .then(data => {
            stopTimer();
            return data;
          });
      } else {
        stopTimer();
      }
    }

    return result;
  };
}

var logger = new Logger();
module.exports = logger;