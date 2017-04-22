'use strict';

const scannersTable = process.env.ATALA_SCANNERS_TABLE;
const db = require('../utils/dbClient');

module.exports.handler = (event, context, callback) => {

  const params = {
    TableName: scannersTable,
    Key:{
      'id': event.path.scannerId
    }
  };

  db.getItem(params, function(err, data) {
    if (err) return callback(err);

    callback(null, data);
  });
};
